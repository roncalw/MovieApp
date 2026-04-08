/*
Step: 7
   * /MovieApp/src/components/MovieCard.tsx
Called by:
   * /MovieApp/src/components/MovieResultsList.tsx
Next step path:
   * /MovieApp/src/screens/MovieDetail.tsx
Purpose:
   * Renders a reusable tappable movie summary card that the shared results list can use across multiple screens.
*/
import React from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import type { movieType } from '../types/MovieTypes';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type MovieCardProps = {
  movie: movieType;
  onPress: () => void;
};

export function MovieCard({ movie, onPress }: MovieCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {movie.poster_path ? (
        <Image
          source={{ uri: `${POSTER_BASE_URL}${movie.poster_path}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      ) : null}

      <Text style={styles.movieTitle}>{movie.title}</Text>
      <Text style={styles.subText}>
        Release Date: {movie.release_date}
      </Text>
      <Text style={styles.subText}>
        Rating: {movie.vote_average} ({movie.vote_count} votes)
      </Text>
      <Text style={styles.overview}>{movie.overview}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  poster: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  overview: {
    fontSize: 15,
    color: '#333',
    marginTop: 8,
    lineHeight: 21,
  },
});
