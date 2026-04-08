/*
Step: 15
   * /MovieApp/src/screens/MovieDetail.tsx
Called by:
   * /MovieApp/src/components/MovieResultsList.tsx
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
  Pressable,
  ScrollView,
} from 'react-native';
import { useMovieDetailsQuery } from '../hooks/queries/useMovieSearchQuery';
import type { movieType } from '../types/MovieTypes';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type MovieDetailProps = {
  movieId: number;
  onBack: () => void;
  initialMovie?: movieType | null;
};

export function MovieDetail({
  movieId,
  onBack,
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
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to results</Text>
        </Pressable>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading movie details...</Text>
      </View>
    );
  }

  if (isError || !movieDetails) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={styles.centered}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to results</Text>
        </Pressable>
        <Text style={styles.errorText}>Error loading movie details</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to results</Text>
      </Pressable>

      {detailImagePath ? (
        <Image
          source={{ uri: `${POSTER_BASE_URL}${detailImagePath}` }}
          style={styles.detailPoster}
          resizeMode="cover"
        />
      ) : null}

      <Text style={styles.detailTitle}>{movieDetails.title}</Text>
      <Text style={styles.detailGenres}>{genreNames}</Text>
      <Text style={styles.detailRating}>
        Rating: {movieDetails.vote_average} ({movieDetails.vote_count} votes)
      </Text>
      <Text style={styles.detailOverview}>{movieDetails.overview}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detailContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#68A1ED',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  detailPoster: {
    width: '100%',
    height: 420,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#eef2f7',
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },
  detailGenres: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 10,
  },
  detailRating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 14,
  },
  detailOverview: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'red',
  },
});
