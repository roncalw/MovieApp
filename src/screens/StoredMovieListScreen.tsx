import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MovieResults } from '../components/body/MovieResults';
import { DetailStackOverlay } from '../components/detail/DetailStackOverlay';
import { DrawerMenuButton } from '../components/navigation/DrawerMenuButton';
import { useDetailStack } from '../hooks/useDetailStack';
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
import type { AppDrawerParamList } from '../navigation/types';

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
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const insets = useSafeAreaInsets();
  const [movies, setMovies] = useState<movieType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    detailStack,
    isDetailStackOpen,
    pushMovie,
    pushPerson,
    popDetail,
    closeAllDetails,
    backToOriginalMovie,
  } = useDetailStack();
  const isDetailOpen = isDetailStackOpen;

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
      closeAllDetails();
      loadMovies();
    }, [closeAllDetails, loadMovies])
  );

  function handlePopDetail() {
    popDetail();
    loadMovies();
  }

  function handleCloseAllDetails() {
    closeAllDetails();
    loadMovies();
  }

  function handleOpenTitleSearch() {
    navigation.navigate('SearchByMovieTitle', {
      returnTo:
        storageKey === 'movieFavoritesData' ? 'MovieFavorites' : 'IHaveSeen',
    });
  }

  return (
    <View style={styles.screen}>
      {isDetailOpen ? null : (
        <View style={[styles.header, { paddingTop: insets.top + scaleSize(10) }]}>
          <DrawerMenuButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            buttonStyle={[
              styles.headerMenuButton,
              { top: insets.top + scaleSize(20) },
            ]}
            imageStyle={styles.headerMenuImage}
          />
          <View style={[styles.headerRow, { top: insets.top + scaleSize(20) }]}>
            <View style={styles.headerSideSlot} />
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </Text>
            <Pressable
              onPress={handleOpenTitleSearch}
              style={styles.headerSearchButton}
              accessibilityRole="button"
              accessibilityLabel="Search by movie title"
            >
              <Ionicons
                name="search-outline"
                size={scaleSize(30)}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>
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
              onMoviePress={pushMovie}
            />
          ) : (
            <View style={styles.centered}>
              <Text allowFontScaling={false} style={styles.message}>
                {emptyMessage}
              </Text>
            </View>
          )}
        </View>

        <DetailStackOverlay
          detailStack={detailStack}
          onPopDetail={handlePopDetail}
          onCloseAllDetails={handleCloseAllDetails}
          onBackToOriginalMovie={backToOriginalMovie}
          onPushMovie={pushMovie}
          onPushPerson={pushPerson}
        />
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
    minHeight: scaleSize(142),
    backgroundColor: colors.background,
  },
  headerRow: {
    position: 'absolute',
    left: scaleSize(36),
    right: scaleSize(36),
    minHeight: scaleSize(48),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSideSlot: {
    width: scaleSize(48),
  },
  headerMenuButton: {
    position: 'absolute',
    left: scaleSize(36),
    zIndex: 2,
  },
  headerMenuImage: {
    width: scaleSize(48),
    height: scaleSize(48),
  },
  title: {
    flex: 1,
    fontSize: scaleSize(22),
    lineHeight: scaleSize(28),
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.brandText,
    textAlign: 'center',
  },
  headerSearchButton: {
    width: scaleSize(48),
    height: scaleSize(48),
    alignItems: 'center',
    justifyContent: 'center',
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
});
