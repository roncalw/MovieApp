/*
Step: 7
   * /MovieApp/src/components/MovieCard.tsx
Imported by:
   * /MovieApp/src/components/MovieResultsList.tsx
Next step path:
   * /MovieApp/src/screens/MovieDetail.tsx
Purpose:
   * Renders a reusable tappable movie summary card that the shared results list can use across multiple screens.
*/
import React from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import type { movieType } from '../types/MovieTypes';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';

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

      {/*
        Keep the card's content text on the shared app-controlled sizes instead of
        letting each device apply its own font scaling on top. This helps the
        movie title, metadata, and overview stay closer between iPhone and Android.
      */}
      <Text allowFontScaling={false} style={styles.movieTitle}>
        {movie.title}
      </Text>
      <Text allowFontScaling={false} style={styles.subText}>
        Release Date: {movie.release_date}
      </Text>
      <Text allowFontScaling={false} style={styles.subText}>
        Rating: {movie.vote_average} ({movie.vote_count} votes)
      </Text>
      <Text allowFontScaling={false} style={styles.overview}>
        {movie.overview}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    /*
      scaleSize(...) lets this card expand or tighten its padding, margin, and
      corner size based on the shared device-width scaling helper. That keeps
      the same card design from feeling oversized on smaller phones.
    */
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scaleSize(10),
    backgroundColor: '#f9f9f9',
  },
  poster: {
    width: '100%',
    height: scaleSize(300),
    borderRadius: scaleSize(8),
    marginBottom: scaleSize(12),
  },
  movieTitle: {
    ...typography.cardTitle,
    marginBottom: scaleSize(6),
  },
  subText: {
    ...typography.cardMeta,
    color: '#555',
    marginBottom: scaleSize(4),
  },
  overview: {
    ...typography.cardBody,
    color: '#333',
    marginTop: scaleSize(8),
  },
});
