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
import {
  loadMovieCardDataForMovies,
  sortMoviesByImdbRating,
} from '../utils/storage/movieCardData';
import {
  getStoredMovieListData,
  saveRefreshedStoredMovieList,
  storedMovieHasCompleteCardData,
  storedMovieToMovieType,
} from '../utils/storage/movieUserListsStorage';
import {
  getLocalCalendarDate,
  isCurrentLocalCalendarDate,
} from '../utils/storage/localCalendarDate';
import type { movieType } from '../types/movie/MovieTypes';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import type { StoredMovieListScreenProps } from '../types/drawer/drawerScreenTypes';
import { usePageRefresh } from '../shared/refresh/usePageRefresh';
import { RefreshableScrollView } from '../shared/refresh/RefreshableScrollView';
import { findStoredMovieListMembershipChanges } from './storedMovieListReconciliation';

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

  const loadAllMovies = useCallback(
    async (forceCardDataRefresh = false) => {
      const today = getLocalCalendarDate();

      async function loadCurrentStoredMovies(retriesRemaining: number) {
        const storedData = await getStoredMovieListData(storageKey);
        const storedMovies = storedData.movies.map(storedMovieToMovieType);
        const canReuseTodaysCardData =
          !forceCardDataRefresh &&
          isCurrentLocalCalendarDate(storedData.cardDataRefreshedLocalDate);
        let loadedMovies: movieType[];

        if (canReuseTodaysCardData) {
          const incompleteStoredMovieIds = new Set(
            storedData.movies
              .filter(movie => !storedMovieHasCompleteCardData(movie))
              .map(movie => movie.id),
          );

          if (incompleteStoredMovieIds.size === 0) {
            return sortMoviesByImdbRating(storedMovies);
          }

          // A same-day add from Movie Detail may not yet have the card fields.
          // Only those newly incomplete movies are requested; every already
          // refreshed Favorite/Seen card is reused from the one saved list.
          const newlyLoadedMovies = await loadMovieCardDataForMovies(
            storedMovies.filter(movie =>
              incompleteStoredMovieIds.has(movie.id),
            ),
            false,
          );
          const newlyLoadedMoviesById = new Map(
            newlyLoadedMovies.map(movie => [movie.id, movie]),
          );

          loadedMovies = sortMoviesByImdbRating(
            storedMovies.map(
              movie => newlyLoadedMoviesById.get(movie.id) ?? movie,
            ),
          );
        } else {
          loadedMovies = await loadMovieCardDataForMovies(storedMovies);
        }

        const saved = await saveRefreshedStoredMovieList(
          storageKey,
          loadedMovies,
          today,
        );

        if (!saved && retriesRemaining > 0) {
          // A Favorite/Seen add or remove happened during the request. Read the
          // new list and rerun once rather than displaying or saving stale IDs.
          return loadCurrentStoredMovies(retriesRemaining - 1);
        }

        if (!saved) {
          throw new Error(`${title} changed while its card data was loading.`);
        }

        return loadedMovies;
      }

      return loadCurrentStoredMovies(1);
    },
    [storageKey, title],
  );

  const refreshAllMovies = useCallback(async () => {
    const runId = ++dataLoadRunIdRef.current;
    const moviesWithCardData = await loadAllMovies(true);

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
              const fallbackData = await getStoredMovieListData(storageKey);
              commitMovies(fallbackData.movies.map(storedMovieToMovieType));
            }
          } finally {
            if (isActive && dataLoadRunIdRef.current === runId) {
              setIsLoading(false);
            }
          }

          return;
        }

        try {
          const storedData = await getStoredMovieListData(storageKey);
          const storedMovies = storedData.movies;
          const currentMovies = moviesRef.current;

          if (
            !isCurrentLocalCalendarDate(storedData.cardDataRefreshedLocalDate)
          ) {
            const moviesWithCardData = await loadAllMovies();

            if (isActive && dataLoadRunIdRef.current === runId) {
              commitMovies(moviesWithCardData);
            }

            return;
          }

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

          if (changes.addedStoredMovies.length === 0) {
            // Removing a movie cannot disturb the order of the remaining
            // IMDb-sorted cards, so this path performs no query and no sort.
            const storedMovieIds = new Set(storedMovies.map(movie => movie.id));
            const nextMovies = currentMovies.filter(movie =>
              storedMovieIds.has(movie.id),
            );

            if (isActive && dataLoadRunIdRef.current === runId) {
              commitMovies(nextMovies);
            }

            return;
          }

          const moviesWithCardData = await loadAllMovies();

          if (isActive && dataLoadRunIdRef.current === runId) {
            commitMovies(moviesWithCardData);
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
          ListHeaderComponent={<>{screenHeader}</>}
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
