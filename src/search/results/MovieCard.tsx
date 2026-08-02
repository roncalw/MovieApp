/*
Step: 7
   * /MovieApp/src/search/results/MovieCard.tsx
Imported by:
   * /MovieApp/src/search/results/MovieResults.tsx
Next step path:
   * /MovieApp/src/movie/MovieDetail.tsx
Purpose:
   * Renders a reusable tappable movie summary card that the shared results list can use across multiple screens.
*/
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import { getMovieImageUri } from '../../utils/movieImages';
import type { MovieCardProps } from '../../types/search/movieResultsTypes';
import { MovieRemoteImage } from '../../shared/images/MovieRemoteImage';

const imageNotFound = require('../../assets/images/MissingMoviePlaceholder.png');

export function MovieCard({
  movie,
  onPress,
  variant = 'summary',
  showRatingBadge = true,
  imageRefreshGeneration,
}: MovieCardProps) {
  const isPosterRating = variant === 'posterRating';
  const movieImageUri = getMovieImageUri(movie);

  return (
    <Pressable
      style={[styles.card, isPosterRating ? styles.posterRatingCard : null]}
      onPress={onPress}
    >
      <View>
        <MovieRemoteImage
          uri={movieImageUri}
          fallbackSource={imageNotFound}
          movieId={movie.id}
          diagnosticContext="Movie results"
          refreshGeneration={imageRefreshGeneration}
          style={[
            styles.poster,
            isPosterRating ? styles.posterRatingImage : null,
          ]}
          resizeMode={isPosterRating ? 'contain' : 'cover'}
        />
        {isPosterRating && showRatingBadge ? (
          <View style={styles.ratingBadge}>
            <Ionicons
              name="star"
              size={scaleSize(12)}
              color="#FFD400"
              accessibilityLabel="Movie rating"
            />
            <Text allowFontScaling={false} style={styles.ratingBadgeText}>
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </Text>
          </View>
        ) : null}
        {isPosterRating && movie.available_with_subscription === false ? (
          <View
            testID="subscription-unavailable-badge"
            accessible
            accessibilityRole="image"
            accessibilityLabel="Not available through a subscription"
            style={styles.subscriptionUnavailableBadge}
          >
            <Ionicons name="bag-handle" size={scaleSize(15)} color="#FFD400" />
          </View>
        ) : null}
      </View>

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
    left: 0,
    bottom: 0,
    minHeight: scaleSize(16),
    minWidth: scaleSize(44),
    flexDirection: 'row',
    paddingHorizontal: scaleSize(4),
    paddingVertical: scaleSize(1),
    borderRadius: scaleSize(8),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(3),
  },
  ratingBadgeText: {
    ...typography.cardMeta,
    color: '#fff',
    fontSize: scaleSize(10),
    fontWeight: '700',
    lineHeight: scaleSize(12),
  },
  subscriptionUnavailableBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minHeight: scaleSize(22),
    minWidth: scaleSize(26),
    paddingHorizontal: scaleSize(5),
    paddingVertical: scaleSize(3),
    borderRadius: scaleSize(9),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
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
