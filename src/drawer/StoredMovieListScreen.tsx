import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { MovieResults } from '../search/results/MovieResults';
import { DrawerScreenHeader } from '../shared/header/DrawerScreenHeader';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import { useDetailNavigation } from '../hooks/useDetailNavigation';
import { drawerScreenStyles as styles } from '../styles/drawer/drawerScreenStyles';
import { loadMovieCardDataForMovies } from '../utils/storage/movieCardData';
import {
  getStoredMovieList,
  storedMovieToMovieType,
} from '../utils/storage/movieUserListsStorage';
import type { movieType } from '../types/movie/MovieTypes';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import type { StoredMovieListScreenProps } from '../types/drawer/drawerScreenTypes';
import { usePageRefresh } from '../shared/refresh/usePageRefresh';
import { RefreshableScrollView } from '../shared/refresh/RefreshableScrollView';
import {
  findStoredMovieListMembershipChanges,
  reconcileStoredMovieListMembership,
} from './storedMovieListReconciliation';

export function StoredMovieListScreen({
  title,
  emptyMessage,
  storageKey,
}: StoredMovieListScreenProps) {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { openMovieDetail } = useDetailNavigation();
  const [movies, setMovies] = useState<movieType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const moviesRef = useRef<movieType[]>([]);
  const hasCompletedInitialLoadRef = useRef(false);
  const dataLoadRunIdRef = useRef(0);

  const commitMovies = useCallback((nextMovies: movieType[]) => {
    moviesRef.current = nextMovies;
    setMovies(nextMovies);
  }, []);

  const loadAllMovies = useCallback(async () => {
    const storedMovies = await getStoredMovieList(storageKey);

    return loadMovieCardDataForMovies(
      storedMovies.map(storedMovieToMovieType),
    );
  }, [storageKey]);

  const refreshAllMovies = useCallback(async () => {
    const runId = ++dataLoadRunIdRef.current;
    const moviesWithCardData = await loadAllMovies();

    if (dataLoadRunIdRef.current !== runId) {
      return;
    }

    commitMovies(moviesWithCardData);
    hasCompletedInitialLoadRef.current = true;
  }, [commitMovies, loadAllMovies]);
  const pageRefresh = usePageRefresh(refreshAllMovies);

  useFocusEffect(
    useCallback(() => {
      const runId = ++dataLoadRunIdRef.current;
      let isActive = true;

      async function synchronizeVisibleList() {
        if (!hasCompletedInitialLoadRef.current) {
          setIsLoading(true);

          try {
            const moviesWithCardData = await loadAllMovies();

            if (isActive && dataLoadRunIdRef.current === runId) {
              commitMovies(moviesWithCardData);
              hasCompletedInitialLoadRef.current = true;
            }
          } catch (error) {
            console.error(`Error loading ${title}:`, error);

            if (isActive && dataLoadRunIdRef.current === runId) {
              commitMovies([]);
            }
          } finally {
            if (isActive && dataLoadRunIdRef.current === runId) {
              setIsLoading(false);
            }
          }

          return;
        }

        try {
          const storedMovies = await getStoredMovieList(storageKey);
          const currentMovies = moviesRef.current;
          const changes = findStoredMovieListMembershipChanges(
            currentMovies,
            storedMovies,
          );

          if (
            changes.addedStoredMovies.length === 0 &&
            changes.removedMovieIds.size === 0
          ) {
            return;
          }

          const shouldShowEmptyListLoading =
            currentMovies.length === 0 &&
            changes.addedStoredMovies.length > 0;

          if (shouldShowEmptyListLoading) {
            setIsLoading(true);
          }

          const addedMoviesWithCardData =
            changes.addedStoredMovies.length > 0
              ? await loadMovieCardDataForMovies(
                  changes.addedStoredMovies.map(storedMovieToMovieType),
                )
              : [];

          if (isActive && dataLoadRunIdRef.current === runId) {
            const nextMovies = reconcileStoredMovieListMembership(
              moviesRef.current,
              storedMovies,
              addedMoviesWithCardData,
            );

            if (nextMovies !== moviesRef.current) {
              commitMovies(nextMovies);
            }
          }

          if (
            shouldShowEmptyListLoading &&
            isActive &&
            dataLoadRunIdRef.current === runId
          ) {
            setIsLoading(false);
          }
        } catch (error) {
          console.error(`Error synchronizing ${title}:`, error);

          if (isActive && dataLoadRunIdRef.current === runId) {
            setIsLoading(false);
          }
        }
      }

      void synchronizeVisibleList();

      return () => {
        isActive = false;

        if (dataLoadRunIdRef.current === runId) {
          dataLoadRunIdRef.current += 1;
        }
      };
    }, [commitMovies, loadAllMovies, storageKey, title]),
  );

  function handleOpenTitleSearch() {
    navigation.navigate('SearchByMovieTitle', {
      returnTo:
        storageKey === 'movieFavoritesData' ? 'MovieFavorites' : 'IHaveSeen',
    });
  }

  const screenHeader = (
    <DrawerScreenHeader
      title={title}
      leftButtonVariant="menu"
      onLeftButtonPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      right={
        <HeaderNavButton
          variant="search"
          anchored={false}
          onPress={handleOpenTitleSearch}
        />
      }
    />
  );

  const loadingStatus = isLoading ? (
    <View style={styles.storedMovieLoadingStatus}>
      <ActivityIndicator size="large" />
      <Text allowFontScaling={false} style={styles.message}>
        Loading movies...
      </Text>
    </View>
  ) : null;

  return (
    <View style={styles.screen}>
      {movies.length > 0 ? (
        <MovieResults
          movies={movies}
          cardVariant="posterRating"
          ListHeaderComponent={
            <>{screenHeader}</>
          }
          ListHeaderComponentStyle={styles.storedMovieListHeader}
          {...pageRefresh}
          onMoviePress={openMovieDetail}
        />
      ) : (
        <RefreshableScrollView
          style={styles.listContent}
          contentContainerStyle={styles.storedMovieScrollContent}
          {...pageRefresh}
        >
          {screenHeader}
          <View style={styles.centered}>
            {loadingStatus ?? (
              <Text allowFontScaling={false} style={styles.message}>
                {emptyMessage}
              </Text>
            )}
          </View>
        </RefreshableScrollView>
      )}
    </View>
  );
}
