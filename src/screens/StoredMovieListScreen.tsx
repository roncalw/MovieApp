import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { MovieResults } from '../components/body/MovieResults';
import { DrawerMenuButton } from '../components/navigation/DrawerMenuButton';
import { MovieDetail } from './MovieDetail';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import { hydrateMoviesWithCurrentImdbRatings } from '../storage/movieListRatingHydration';
import {
  getStoredMovieList,
  storedMovieToMovieType,
  type MovieUserListStorageKey,
} from '../storage/movieUserListsStorage';
import type { movieType } from '../types/MovieTypes';

type StoredMovieListScreenProps = {
  title: string;
  emptyMessage: string;
  storageKey: MovieUserListStorageKey;
};

export function StoredMovieListScreen({
  title,
  emptyMessage,
  storageKey,
}: StoredMovieListScreenProps) {
  const navigation = useNavigation();
  const [movies, setMovies] = useState<movieType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedMovieFromList, setSelectedMovieFromList] =
    useState<movieType | null>(null);
  const isDetailOpen = selectedMovieId !== null;

  const loadMovies = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedMovies = await getStoredMovieList(storageKey);
      const hydratedMovies = await hydrateMoviesWithCurrentImdbRatings(
        storedMovies.map(storedMovieToMovieType)
      );

      setMovies(hydratedMovies);
    } catch (error) {
      console.error(`Error loading ${title}:`, error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, title]);

  useFocusEffect(
    useCallback(() => {
      setSelectedMovieId(null);
      setSelectedMovieFromList(null);
      loadMovies();
    }, [loadMovies])
  );

  function handleOpenMovie(movie: movieType) {
    setSelectedMovieId(movie.id);
    setSelectedMovieFromList(movie);
  }

  function handleCloseMovieDetail() {
    setSelectedMovieId(null);
    setSelectedMovieFromList(null);
    loadMovies();
  }

  return (
    <View style={styles.screen}>
      {isDetailOpen ? null : (
        <View style={styles.header}>
          <DrawerMenuButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />
          <Text allowFontScaling={false} style={styles.title}>
            {title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <View style={styles.contentStack}>
        <View
          pointerEvents={isDetailOpen ? 'none' : 'auto'}
          accessibilityElementsHidden={isDetailOpen}
          importantForAccessibility={
            isDetailOpen ? 'no-hide-descendants' : 'auto'
          }
          style={[
            styles.listContent,
            isDetailOpen ? styles.listContentHidden : null,
          ]}
        >
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
              <Text allowFontScaling={false} style={styles.message}>
                Loading movies...
              </Text>
            </View>
          ) : movies.length > 0 ? (
            <MovieResults
              movies={movies}
              cardVariant="posterRating"
              onMoviePress={handleOpenMovie}
            />
          ) : (
            <View style={styles.centered}>
              <Text allowFontScaling={false} style={styles.message}>
                {emptyMessage}
              </Text>
            </View>
          )}
        </View>

        {selectedMovieId !== null ? (
          <View style={styles.detailOverlay}>
            <MovieDetail
              movieId={selectedMovieId}
              initialMovie={selectedMovieFromList}
              onBackPress={handleCloseMovieDetail}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: scaleSize(104),
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: scaleSize(16),
    paddingBottom: scaleSize(14),
    backgroundColor: colors.background,
  },
  title: {
    flex: 1,
    ...typography.pageTitle,
    color: colors.brandText,
    textAlign: 'center',
  },
  headerSpacer: {
    width: scaleSize(80),
  },
  contentStack: {
    flex: 1,
  },
  listContent: {
    flex: 1,
  },
  listContentHidden: {
    opacity: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(12),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: colors.background,
  },
});
