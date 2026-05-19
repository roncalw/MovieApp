/*
Step: Home movie poster row
   * /MovieApp/src/components/home/HomeMoviePosterRow.tsx
Imported by:
   * /MovieApp/src/screens/HomeScreen.tsx
Purpose:
   * Renders one horizontal poster row for the Home page, matching the legacy carousel shape while keeping the tap action owned
     by HomeScreen.
*/
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { movieType } from '../../types/MovieTypes';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type HomeMoviePosterRowProps = {
  title: string;
  movies: movieType[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onMoviePress: (movie: movieType) => void;
};

export function HomeMoviePosterRow({
  title,
  movies,
  isLoading,
  isError,
  onMoviePress,
}: HomeMoviePosterRowProps) {
  const posterMovies = movies?.filter(movie => Boolean(movie.poster_path)) ?? [];

  return (
    <View style={styles.rowSection}>
      <Text allowFontScaling={false} style={styles.rowTitle}>
        {title}
      </Text>

      {isLoading ? (
        <View style={styles.rowStatus}>
          <ActivityIndicator size="small" />
        </View>
      ) : null}

      {isError ? (
        <Text allowFontScaling={false} style={styles.rowError}>
          Error loading movies
        </Text>
      ) : null}

      {!isLoading && !isError ? (
        <FlatList
          data={posterMovies}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.posterListContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onMoviePress(item)}
              style={styles.posterCard}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title || item.original_title}`}
            >
              <Image
                source={{ uri: `${POSTER_BASE_URL}${item.poster_path}` }}
                style={styles.posterImage}
                resizeMode="cover"
              />
            </Pressable>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rowSection: {
    paddingTop: scaleSize(25),
    backgroundColor: colors.background,
  },
  rowTitle: {
    ...typography.pageTitle,
    fontSize: scaleSize(20),
    lineHeight: scaleSize(26),
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(5),
    color: colors.textPrimary,
  },
  posterListContent: {
    paddingHorizontal: scaleSize(5),
    paddingBottom: scaleSize(16),
  },
  posterCard: {
    padding: scaleSize(5),
    height: scaleSize(210),
    alignItems: 'center',
  },
  posterImage: {
    width: scaleSize(120),
    height: scaleSize(200),
    borderRadius: scaleSize(20),
    backgroundColor: '#f3f4f6',
  },
  rowStatus: {
    minHeight: scaleSize(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowError: {
    ...typography.feedbackBody,
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(16),
    color: colors.brandText,
  },
});
