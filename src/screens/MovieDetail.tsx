/*
Step: 15
   * /MovieApp/src/screens/MovieDetail.tsx
Imported by:
   * /MovieApp/src/components/body/MovieResults.tsx
Next step path:
   * /MovieApp/src/hooks/queries/useMovieSearchQuery.ts
Purpose:
   * Shows the selected movie detail view, fetches the full movie record by id, and exposes a back action that returns the 
     user to the search results.
*/
import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useMovieDetailsQuery } from '../hooks/queries/useMovieSearchQuery';
import type { movieType } from '../types/MovieTypes';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type MovieDetailProps = {
  movieId: number;
  initialMovie?: movieType | null;
};

export function MovieDetail({
  movieId,
  initialMovie,
}: MovieDetailProps) {
  const {
    data: movieDetails,
    isLoading,
    isError,
    error,
  } = useMovieDetailsQuery(movieId);

  const detailImagePath =
    movieDetails?.poster_path ??
    movieDetails?.backdrop_path ??
    initialMovie?.poster_path ??
    initialMovie?.backdrop_path;

  const genreNames =
    movieDetails?.genres?.map((genre) => genre.name).join(', ') ||
    'Genres unavailable';

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text allowFontScaling={false} style={styles.message}>
          Loading movie details...
        </Text>
      </View>
    );
  }

  if (isError || !movieDetails) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={styles.centered}>
        <Text allowFontScaling={false} style={styles.errorText}>
          Error loading movie details
        </Text>
        <Text allowFontScaling={false} style={styles.message}>
          {message}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      {detailImagePath ? (
        <Image
          source={{ uri: `${POSTER_BASE_URL}${detailImagePath}` }}
          style={styles.detailPoster}
          resizeMode="cover"
        />
      ) : null}

      <Text allowFontScaling={false} style={styles.detailTitle}>
        {movieDetails.title}
      </Text>
      <Text allowFontScaling={false} style={styles.detailGenres}>
        {genreNames}
      </Text>
      <Text allowFontScaling={false} style={styles.detailRating}>
        Rating: {movieDetails.vote_average} ({movieDetails.vote_count} votes)
      </Text>
      <Text allowFontScaling={false} style={styles.detailOverview}>
        {movieDetails.overview}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detailContent: {
    /*
      scaleSize(...) lets the detail screen's padding, button size, poster
      size, and spacing respond to the shared width-based scale instead of
      assuming one fixed phone size.
    */
    padding: scaleSize(16),
    backgroundColor: colors.background,
  },
  detailPoster: {
    width: '100%',
    height: scaleSize(420),
    borderRadius: scaleSize(12),
    marginBottom: scaleSize(16),
    backgroundColor: '#eef2f7',
  },
  detailTitle: {
    ...typography.detailTitle,
    marginBottom: scaleSize(10),
    color: '#111827',
  },
  detailGenres: {
    ...typography.detailMeta,
    color: '#4B5563',
    marginBottom: scaleSize(10),
  },
  detailRating: {
    ...typography.detailMetaStrong,
    color: '#1F2937',
    marginBottom: scaleSize(14),
  },
  detailOverview: {
    ...typography.detailBody,
    color: '#374151',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
    backgroundColor: colors.background,
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    textAlign: 'center',
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.feedbackTitle,
    color: colors.brandText,
  },
});
