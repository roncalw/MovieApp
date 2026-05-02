/*
Step: 7
   * /MovieApp/src/components/ui/MovieCard.tsx
Imported by:
   * /MovieApp/src/components/body/MovieResults.tsx
Next step path:
   * /MovieApp/src/screens/MovieDetail.tsx
Purpose:
   * Renders a reusable tappable movie summary card that the shared results list can use across multiple screens.
*/
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { movieType } from '../../types/MovieTypes';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type MovieCardProps = {
  movie: movieType;
  onPress: () => void;
  variant?: 'summary' | 'posterRating';
};

export function MovieCard({ movie, onPress, variant = 'summary' }: MovieCardProps) {
  const isPosterRating = variant === 'posterRating';

  return (
    <Pressable
      style={[styles.card, isPosterRating ? styles.posterRatingCard : null]}
      onPress={onPress}
    >
      {movie.poster_path ? (
        <View>
          <Image
            source={{ uri: `${POSTER_BASE_URL}${movie.poster_path}` }}
            style={[
              styles.poster,
              isPosterRating ? styles.posterRatingImage : null,
            ]}
            resizeMode={isPosterRating ? 'contain' : 'cover'}
          />
          <View style={styles.ratingBadge}>
            <Text allowFontScaling={false} style={styles.ratingBadgeText}>
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </Text>
          </View>
        </View>
      ) : null}

      {!isPosterRating ? (
        <>
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
        </>
      ) : null}
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
  posterRatingCard: {
    padding: 0,
    marginBottom: 0,
    borderWidth: 0,
    borderRadius: scaleSize(10),
    backgroundColor: 'transparent',
  },
  poster: {
    width: '100%',
    height: scaleSize(300),
    borderRadius: scaleSize(8),
    marginBottom: scaleSize(12),
  },
  posterRatingImage: {
    height: undefined,
    aspectRatio: 2 / 3,
    marginBottom: 0,
    borderRadius: scaleSize(10),
    backgroundColor: '#f3f4f6',
  },
  ratingBadge: {
    position: 'absolute',
    top: scaleSize(6),
    right: scaleSize(6),
    minWidth: scaleSize(36),
    paddingHorizontal: scaleSize(6),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(14),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
  },
  ratingBadgeText: {
    ...typography.cardMeta,
    color: '#fff',
    fontWeight: '700',
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
