/*
Step: 15
   * /MovieApp/src/movie/MovieDetail.tsx
Imported by:
   * /MovieApp/src/home/HomeScreen.tsx
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/hooks/useMovieSearchQuery.ts
Purpose:
   * Shows the selected movie detail view inside the existing Home/Search overlay, using the legacy Movie Detail layout as the
     visual reference while keeping unfinished actions such as favorites inactive.
*/
import React, { useCallback, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useMovieDetailsQuery,
  useMovieExternalIdsQuery,
  useMovieListImdbRatingQuery,
  useMovieVideosQuery,
  useMovieWatchProvidersQuery,
} from '../hooks/useMovieSearchQuery';
import { ExpandableText } from '../shared/ExpandableText';
import {
  DetailResourceError,
  DetailResourceLoading,
} from '../shared/DetailResourceState';
import type {
  movieGenres,
  movieTrailerVideo,
  movieType,
} from '../types/movie/MovieTypes';
import type { MovieDetailProps } from '../types/movie/movieDetailTypes';
import { colors } from '../styles/colors';
import { scaleSize } from '../styles/scale';
import { movieDetailStyles as styles } from '../styles/movie/movieDetailStyles';
import { MovieCreditsRail } from './components/MovieCreditsRail';
import { MovieDetailInfoSections } from './components/MovieDetailInfoSections';
import { MovieHero } from './components/MovieHero';
import { MovieTrailerModal } from './components/MovieTrailerModal';
import { RenderedImdbRatingScraper } from './imdb/RenderedImdbRatingScraper';
import { useMovieImdbRating } from './imdb/useMovieImdbRating';
import { useMovieUserListActions } from './useMovieUserListActions';

export function MovieDetail({
  movieId,
  initialMovie,
  onBackPress,
  onPersonPress,
}: MovieDetailProps) {
  const insets = useSafeAreaInsets();
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const nativeTopSpacerHeight = getNativeTopSpacerHeight(insets.top);
  const movieQuery = useMovieDetailsQuery(movieId);
  const videosQuery = useMovieVideosQuery(movieId);
  const externalIdsQuery = useMovieExternalIdsQuery(movieId);
  const watchProvidersQuery = useMovieWatchProvidersQuery(movieId);
  const { data: movieListImdbRating } = useMovieListImdbRatingQuery(movieId);

  /*
    Keep the existing screen/component contract while sourcing each nested TMDB
    resource independently. The object below is assembled only in memory; no
    combined append_to_response request is sent over the network.
  */
  const movieDetails = useMemo(
    () =>
      movieQuery.data
        ? {
            ...movieQuery.data,
            videos: videosQuery.data,
            external_ids: externalIdsQuery.data,
            'watch/providers': watchProvidersQuery.data,
          }
        : undefined,
    [
      externalIdsQuery.data,
      movieQuery.data,
      videosQuery.data,
      watchProvidersQuery.data,
    ],
  );
  const displayMovie = movieDetails ?? initialMovie ?? null;
  const {
    handleImdbScrapeResult,
    handleRetryImdbRating,
    imdbRating,
    imdbRefreshStatus,
    imdbScrapeRequest,
    isScrapingImdbRating,
  } = useMovieImdbRating({
    movieDetails,
    movieId,
    movieListImdbRating,
  });
  const preferredTrailer = useMemo(
    () => getPreferredYouTubeTrailer(movieDetails?.videos?.results ?? []),
    [movieDetails?.videos?.results],
  );
  const handleOpenTrailer = useCallback(() => {
    if (preferredTrailer) {
      setActiveTrailerKey(preferredTrailer.key);
    }
  }, [preferredTrailer]);
  const handleCloseTrailer = useCallback(() => {
    setActiveTrailerKey(null);
  }, []);

  return (
    <View style={styles.screen}>
      <View
        style={[styles.nativeTopSpacer, { height: nativeTopSpacerHeight }]}
      />

      <ScrollView
        style={styles.detailScroll}
        contentContainerStyle={styles.detailContent}
      >
        <MovieHero
          movie={displayMovie}
          imdbRating={imdbRating}
          imdbRefreshStatus={imdbRefreshStatus}
          isImdbRatingLoading={isScrapingImdbRating}
          onBackPress={onBackPress}
          onRetryImdbRating={handleRetryImdbRating}
        />

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
            movie={movieDetails}
            imdbRating={imdbRating}
            trailer={preferredTrailer}
            onTrailerPress={handleOpenTrailer}
            onPersonPress={onPersonPress}
            videosError={videosQuery.error}
            videosFailed={videosQuery.isError}
            videosRetrying={videosQuery.isFetching}
            onRetryVideos={videosQuery.refetch}
            externalIdsError={externalIdsQuery.error}
            externalIdsFailed={externalIdsQuery.isError}
            externalIdsRetrying={externalIdsQuery.isFetching}
            onRetryExternalIds={externalIdsQuery.refetch}
            watchProvidersError={watchProvidersQuery.error}
            watchProvidersFailed={watchProvidersQuery.isError}
            watchProvidersLoading={watchProvidersQuery.isLoading}
            watchProvidersRetrying={watchProvidersQuery.isFetching}
            onRetryWatchProviders={watchProvidersQuery.refetch}
          />
        ) : null}
      </ScrollView>

      <MovieTrailerModal
        trailerKey={activeTrailerKey}
        onClose={handleCloseTrailer}
      />
      <RenderedImdbRatingScraper
        scrapeRequest={imdbScrapeRequest}
        onResult={handleImdbScrapeResult}
      />
    </View>
  );
}

function LoadedMovieDetail({
  movie,
  imdbRating,
  trailer,
  onTrailerPress,
  onPersonPress,
  videosError,
  videosFailed,
  videosRetrying,
  onRetryVideos,
  externalIdsError,
  externalIdsFailed,
  externalIdsRetrying,
  onRetryExternalIds,
  watchProvidersError,
  watchProvidersFailed,
  watchProvidersLoading,
  watchProvidersRetrying,
  onRetryWatchProviders,
}: {
  movie: movieType;
  imdbRating: number | null;
  trailer: movieTrailerVideo | null;
  onTrailerPress: () => void;
  onPersonPress?: (personId: number, initialPersonName?: string) => void;
  videosError: unknown;
  videosFailed: boolean;
  videosRetrying: boolean;
  onRetryVideos: () => void;
  externalIdsError: unknown;
  externalIdsFailed: boolean;
  externalIdsRetrying: boolean;
  onRetryExternalIds: () => void;
  watchProvidersError: unknown;
  watchProvidersFailed: boolean;
  watchProvidersLoading: boolean;
  watchProvidersRetrying: boolean;
  onRetryWatchProviders: () => void;
}) {
  const movieRating = getUsCertification(movie);
  const releaseDate = formatReleaseDate(movie.release_date);
  const imdbReviewsUrl = getImdbReviewsUrl(movie.external_ids?.imdb_id);
  const cast = movie.credits?.cast ?? [];
  const crew = movie.credits?.crew ?? [];
  const { handleFavoritePress, handleSeenPress, isFavorite, isSeen } =
    useMovieUserListActions(movie);

  return (
    <>
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

          {trailer ? (
            <Pressable
              onPress={onTrailerPress}
              style={styles.trailerPlayButton}
              accessibilityRole="button"
              accessibilityLabel={`Play trailer: ${trailer.name}`}
            >
              <View style={styles.trailerPlayCircle}>
                <Ionicons
                  name="caret-forward"
                  size={scaleSize(26)}
                  color={colors.actionOnPrimary}
                />
              </View>
            </Pressable>
          ) : null}
        </View>

        <Text
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={2}
          style={styles.movieTitle}
        >
          {movie.title}
        </Text>

        <GenreList genres={movie.genres ?? []} />
        <MovieStarRating imdbRating={imdbRating} />

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

        {imdbReviewsUrl ? <ReviewsLink url={imdbReviewsUrl} /> : null}
      </View>

      {videosFailed ? (
        <DetailResourceError
          compact
          error={videosError}
          isRetrying={videosRetrying}
          message="Trailer information could not be loaded."
          onRetry={onRetryVideos}
          title="Trailer temporarily unavailable"
        />
      ) : null}

      {externalIdsFailed ? (
        <DetailResourceError
          compact
          error={externalIdsError}
          isRetrying={externalIdsRetrying}
          message="The IMDb review link could not be loaded."
          onRetry={onRetryExternalIds}
          title="IMDb review link temporarily unavailable"
        />
      ) : null}

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
      <MovieDetailInfoSections
        movie={movie}
        watchProvidersError={watchProvidersError}
        watchProvidersFailed={watchProvidersFailed}
        watchProvidersLoading={watchProvidersLoading}
        watchProvidersRetrying={watchProvidersRetrying}
        onRetryWatchProviders={onRetryWatchProviders}
      />
    </>
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

function getPreferredYouTubeTrailer(videos: movieTrailerVideo[]) {
  const youtubeTrailers = videos.filter(
    video => video.site === 'YouTube' && video.type === 'Trailer' && video.key,
  );
  const officialTrailer = youtubeTrailers.find(video => video.official);

  return officialTrailer ?? youtubeTrailers[0] ?? null;
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
