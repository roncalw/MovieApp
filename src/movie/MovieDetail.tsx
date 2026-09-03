/*
Step: 15
   * /MovieApp/src/movie/MovieDetail.tsx
Imported by:
   * /MovieApp/src/home/HomeScreen.tsx
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/hooks/useMovieSearchQuery.ts
Purpose:
   * Shows the selected movie on its own native-stack screen while keeping each secondary resource scoped to the small feature
     that consumes it.
*/
import React, { useCallback, useMemo } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMovieDetailsQuery } from '../hooks/useMovieSearchQuery';
import { ExpandableText } from '../shared/ExpandableText';
import {
  DetailResourceError,
  DetailResourceLoading,
} from '../shared/DetailResourceState';
import type { movieGenres, movieType } from '../types/movie/MovieTypes';
import type { MovieDetailProps } from '../types/movie/movieDetailTypes';
import { colors } from '../styles/colors';
import { scaleSize } from '../styles/scale';
import { movieDetailStyles as styles } from '../styles/movie/movieDetailStyles';
import { MovieCreditsRail } from './components/MovieCreditsRail';
import { MovieDetailInfoSections } from './components/MovieDetailInfoSections';
import { sortMovieDetailCrew } from './sortMovieDetailCrew';
import {
  MovieTrailerButton,
  MovieTrailerFeedback,
  MovieTrailerProvider,
} from './components/MovieTrailerFeature';
import {
  MovieImdbHero,
  MovieImdbProvider,
  useMovieImdbFeature,
} from './imdb/MovieImdbProvider';
import { useMovieUserListActions } from './useMovieUserListActions';
import { RefreshableScrollView } from '../shared/refresh/RefreshableScrollView';
import { usePageRefresh } from '../shared/refresh/usePageRefresh';
import { queryKeys } from '../query/queryKeys';
import { getMovieDetailTitles } from './movieDetailTitle';

export function MovieDetail({
  movieId,
  initialMovie,
  onBackPress,
  onPersonPress,
}: MovieDetailProps) {
  const insets = useSafeAreaInsets();
  const nativeTopSpacerHeight = getNativeTopSpacerHeight(insets.top);
  const queryClient = useQueryClient();
  const movieQuery = useMovieDetailsQuery(movieId);
  const refetchMovieDetails = movieQuery.refetch;
  const refreshMovieDetail = useCallback(async () => {
    const secondaryQueryKeys = [
      queryKeys.movieVideos(movieId),
      queryKeys.movieExternalIds(movieId),
      queryKeys.movieWatchProviders(movieId),
      queryKeys.movieListImdbRating(movieId),
    ];

    await Promise.allSettled([
      refetchMovieDetails(),
      ...secondaryQueryKeys.map(queryKey =>
        queryClient.refetchQueries({
          queryKey,
          exact: true,
        }),
      ),
    ]);
  }, [movieId, queryClient, refetchMovieDetails]);
  const pageRefresh = usePageRefresh(refreshMovieDetail);

  const movieDetails = movieQuery.data;
  const displayMovie = movieDetails ?? initialMovie ?? null;

  return (
    <MovieImdbProvider movieId={movieId}>
      <View style={styles.screen}>
        <View
          style={[styles.nativeTopSpacer, { height: nativeTopSpacerHeight }]}
        />

        <RefreshableScrollView
          style={styles.detailScroll}
          contentContainerStyle={styles.detailContent}
          {...pageRefresh}
        >
          <MovieImdbHero movie={displayMovie} onBackPress={onBackPress} />

          {movieQuery.isLoading ? (
            <LoadingState />
          ) : movieQuery.isError ? (
            <ErrorState
              error={movieQuery.error}
              isRetrying={movieQuery.isFetching}
              onRetry={movieQuery.refetch}
            />
          ) : movieDetails ? (
            <LoadedMovieDetail
              movieId={movieId}
              movie={movieDetails}
              onPersonPress={onPersonPress}
            />
          ) : null}
        </RefreshableScrollView>
      </View>
    </MovieImdbProvider>
  );
}

function LoadedMovieDetail({
  movieId,
  movie,
  onPersonPress,
}: {
  movieId: number;
  movie: movieType;
  onPersonPress?: (personId: number, initialPersonName?: string) => void;
}) {
  const movieRating = getUsCertification(movie);
  const releaseDate = formatReleaseDate(movie.release_date);
  const { primaryTitle, alternateTitles } = getMovieDetailTitles(movie);
  const cast = movie.credits?.cast ?? [];
  const crew = useMemo(
    () => sortMovieDetailCrew(movie.credits?.crew ?? []),
    [movie.credits?.crew],
  );
  const { handleFavoritePress, handleSeenPress, isFavorite, isSeen } =
    useMovieUserListActions(movie);

  return (
    <MovieTrailerProvider movieId={movieId}>
      <View style={styles.summaryCard}>
        <View style={styles.actionIconRow}>
          <Pressable
            onPress={handleFavoritePress}
            style={styles.heartButton}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'Remove favorite' : 'Save favorite'
            }
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={scaleSize(48)}
              color={isFavorite ? colors.favoriteActive : colors.disabledText}
            />
          </Pressable>

          <Pressable
            onPress={handleSeenPress}
            style={[styles.seenButton, isSeen ? styles.seenButtonActive : null]}
            accessibilityRole="button"
            accessibilityLabel={
              isSeen ? 'Remove from seen movies' : 'Mark as seen'
            }
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.seenButtonText,
                isSeen ? styles.seenButtonTextActive : null,
              ]}
            >
              Seen
            </Text>
          </Pressable>

          <MovieTrailerButton />
        </View>

        <Text
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={2}
          style={[
            styles.movieTitle,
            alternateTitles.length > 0
              ? styles.movieTitleWithAlternates
              : null,
          ]}
        >
          {primaryTitle}
        </Text>

        {alternateTitles.length > 0 ? (
          <Text allowFontScaling={false} style={styles.alternateMovieTitles}>
            (a.k.a. {alternateTitles.join(', ')})
          </Text>
        ) : null}

        <GenreList genres={movie.genres ?? []} />
        <MovieImdbStarRating />

        <ExpandableText
          text={movie.overview || 'Overview is not available.'}
          collapsedLines={20}
          containerStyle={styles.overviewBlock}
          textStyle={styles.overview}
        />

        {movieRating ? (
          <Text allowFontScaling={false} style={styles.boldMetaText}>
            Rated: {movieRating}
          </Text>
        ) : null}

        <Text allowFontScaling={false} style={styles.boldMetaText}>
          Release Date: {releaseDate}
        </Text>

        <MovieImdbReviews />
      </View>

      <MovieTrailerFeedback />

      <MovieCreditsRail
        title="Cast"
        people={cast}
        onPersonPress={onPersonPress}
      />
      <MovieCreditsRail
        title="Crew"
        people={crew}
        onPersonPress={onPersonPress}
      />
      <MovieDetailInfoSections movieId={movieId} movie={movie} />
    </MovieTrailerProvider>
  );
}

function ReviewsLink({ url }: { url: string }) {
  const handlePress = useCallback(() => {
    Linking.openURL(url).catch(error => {
      console.error('Error opening IMDb reviews:', error);
    });
  }, [url]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.reviewsLinkButton}
      accessibilityRole="link"
      accessibilityLabel="Open IMDb reviews"
    >
      <Text allowFontScaling={false} style={styles.reviewsLinkText}>
        Reviews
      </Text>
    </Pressable>
  );
}

function MovieImdbStarRating() {
  const { imdbRating } = useMovieImdbFeature();

  return <MovieStarRating imdbRating={imdbRating} />;
}

function MovieImdbReviews() {
  const {
    externalIdsError,
    externalIdsFailed,
    externalIdsRetrying,
    imdbId,
    onRetryExternalIds,
  } = useMovieImdbFeature();

  if (externalIdsFailed) {
    return (
      <DetailResourceError
        compact
        error={externalIdsError}
        isRetrying={externalIdsRetrying}
        message="The IMDb review link could not be loaded."
        onRetry={onRetryExternalIds}
        title="IMDb review link temporarily unavailable"
      />
    );
  }

  const imdbReviewsUrl = getImdbReviewsUrl(imdbId);

  return imdbReviewsUrl ? <ReviewsLink url={imdbReviewsUrl} /> : null;
}

function LoadingState() {
  return <DetailResourceLoading message="Loading movie details..." />;
}

function ErrorState({
  error,
  isRetrying,
  onRetry,
}: {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <DetailResourceError
      error={error}
      isRetrying={isRetrying}
      message="Movie details could not be loaded."
      onRetry={onRetry}
      title="Movie details are temporarily unavailable"
    />
  );
}

function GenreList({ genres }: { genres: movieGenres[] }) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.genresContainer}>
      {genres.map(genre => (
        <Text allowFontScaling={false} style={styles.genre} key={genre.id}>
          {genre.name}
        </Text>
      ))}
    </View>
  );
}

function MovieStarRating({ imdbRating }: { imdbRating: number | null }) {
  const starRating =
    imdbRating === null ? 0 : Math.max(0, Math.min(5, imdbRating / 2));

  return (
    <View
      style={styles.starRow}
      accessibilityLabel={`Movie rating ${starRating.toFixed(
        1,
      )} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map(starIndex => {
        const fillAmount = starRating - starIndex;
        const iconName =
          fillAmount >= 0.75
            ? 'star'
            : fillAmount >= 0.25
            ? 'star-half'
            : 'star-outline';

        return (
          <Ionicons
            key={starIndex}
            name={iconName}
            size={scaleSize(28)}
            color={
              iconName === 'star-outline'
                ? colors.disabledText
                : colors.starFilled
            }
            style={iconName === 'star-outline' ? styles.emptyStar : null}
          />
        );
      })}
    </View>
  );
}

function getUsCertification(movie: movieType) {
  const usRelease = movie.release_dates?.results?.find(
    releaseCountry => releaseCountry.iso_3166_1 === 'US',
  );
  const releaseDetailWithCertification = usRelease?.release_dates?.find(
    releaseDetail => releaseDetail.certification,
  );

  return releaseDetailWithCertification?.certification ?? '';
}

function formatReleaseDate(releaseDate: string | undefined) {
  if (!releaseDate) {
    return 'Data not available.';
  }

  const date = new Date(`${releaseDate}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return releaseDate;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

function getImdbReviewsUrl(imdbId: string | undefined) {
  return imdbId ? `https://www.imdb.com/title/${imdbId}/reviews/` : null;
}

/*
  Movie Detail intentionally owns its top native spacer.

  The app-level SafeAreaView protects only the left and right edges because the
  Home screen hero is designed to draw behind the top status area. The legacy
  Movie Detail screen is different: it starts below the phone time, Wi-Fi, and
  battery icons. This helper keeps that rule local to Movie Detail and prevents
  the spacer from collapsing if a simulator or Android device reports a zero
  top safe-area inset.
*/
function getNativeTopSpacerHeight(topInset: number) {
  const fallbackTopSpacer =
    Platform.OS === 'android'
      ? StatusBar.currentHeight ?? scaleSize(24)
      : scaleSize(54);

  return Math.max(topInset, fallbackTopSpacer);
}
