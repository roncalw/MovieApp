/**
 * Movie Detail hero image, back button, and IMDb refresh badge.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx
 *
 * Code flow:
 * 1. MovieDetail loads the selected movie and combines Cloudflare/IMDb rating data.
 * 2. MovieDetail passes the display movie, rating state, and retry handler here.
 * 3. MovieHero renders only the top visual section and delegates IMDb retry taps
 *    back to MovieDetail through onRetryImdbRating.
 */
import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import type { ImdbWebsiteRatingScrapeStatus } from '../../types/tmdb/tmdbApiTypes';
import type { movieType } from '../../types/movie/MovieTypes';
import { imageAssets } from '../../styles/assets';
import { colors } from '../../styles/colors';
import { scaleSize } from '../../styles/scale';
import { movieHeroStyles as styles } from '../../styles/movie/movieHeroStyles';
import { getMovieImageUri } from '../../utils/movieImages';
import { MovieRemoteImage } from '../../shared/images/MovieRemoteImage';

export function MovieHero({
  movie,
  imdbRating,
  imdbRefreshStatus,
  isImdbRatingLoading,
  onBackPress,
  onRetryImdbRating,
}: {
  movie: movieType | null;
  imdbRating: number | null;
  imdbRefreshStatus: ImdbWebsiteRatingScrapeStatus | null;
  isImdbRatingLoading: boolean;
  onBackPress?: () => void;
  onRetryImdbRating: () => void;
}) {
  const posterUri = getMovieImageUri(movie);
  const hasImdbRating = imdbRating !== null;
  const missingImdbCopy = getMissingImdbCopy(imdbRefreshStatus);

  return (
    <ImageBackground
      source={imageAssets.cinemaMenu}
      style={styles.heroBackground}
      imageStyle={styles.heroBackgroundImage}
      resizeMode="repeat"
    >
      <View style={styles.heroScrim}>
        {onBackPress ? (
          <Pressable
            onPress={onBackPress}
            style={styles.heroBackButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons
              name="chevron-back"
              size={scaleSize(44)}
              color={colors.movieBackButton}
            />
          </Pressable>
        ) : null}

        <MovieRemoteImage
          uri={posterUri}
          fallbackSource={imageAssets.missingMovie}
          movieId={movie?.id}
          diagnosticContext="Movie Detail hero"
          style={styles.heroPoster}
          resizeMode="cover"
        />

        <Pressable
          onPress={
            hasImdbRating || isImdbRatingLoading ? undefined : onRetryImdbRating
          }
          disabled={hasImdbRating || isImdbRatingLoading}
          style={styles.imdbBadge}
          accessibilityRole="button"
          accessibilityLabel={
            hasImdbRating
              ? `IMDb rating ${imdbRating}`
              : 'Scrape IMDb rating from IMDb'
          }
        >
          <Image
            source={imageAssets.imdbLogo}
            style={styles.imdbLogo}
            resizeMode="contain"
            accessibilityLabel="IMDb"
          />
          <Text allowFontScaling={false} style={styles.imdbRatingText}>
            {isImdbRatingLoading
              ? 'Loading...'
              : hasImdbRating
                ? formatImdbRating(imdbRating)
                : missingImdbCopy.primary}
          </Text>
          {!hasImdbRating && !isImdbRatingLoading ? (
            <Text allowFontScaling={false} style={styles.imdbVotesText}>
              {missingImdbCopy.secondary}
            </Text>
          ) : null}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

function formatImdbRating(imdbRating: number) {
  return imdbRating.toFixed(1);
}

function getMissingImdbCopy(status: ImdbWebsiteRatingScrapeStatus | null) {
  if (status === 'rating_not_found') {
    return {
      primary: 'No Data',
      secondary: 'No Rating Yet',
    };
  }

  if (status === 'imdb_challenge' || status === 'request_failed') {
    return {
      primary: 'Try Later',
      secondary: 'Data is Pending',
    };
  }

  return {
    primary: 'No Data',
    secondary: 'Tap to Refresh',
  };
}
