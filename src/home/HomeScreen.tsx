/*
Step: Home screen
   * /MovieApp/src/home/HomeScreen.tsx
Imported by:
   * /MovieApp/src/navigation/AppNavigator.tsx
Next step path:
   * /MovieApp/src/home/HomeHeroCarousel.tsx
   * /MovieApp/src/home/HomeMoviePosterRow.tsx
Purpose:
   * Recreates the legacy Home entry point with an upcoming-movie hero carousel, TMDB poster rows, and the same
     local movie-detail overlay behavior used by Advanced Search.
*/
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  DrawerActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import {
  useHomeGenreMoviesQuery,
  usePopularMoviesQuery,
  useStreamingMoviesQuery,
  useUpcomingMoviesQuery,
} from '../hooks/useMovieSearchQuery';
import { HomeHeroCarousel } from './HomeHeroCarousel';
import { HomeMoviePosterRow } from './HomeMoviePosterRow';
import { HOME_ADVANCED_SEARCH_SECTIONS } from './homeAdvancedSearchSections';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import { useDetailNavigation } from '../hooks/useDetailNavigation';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import type { HomeAdvancedSearchSectionId } from '../types/home/homeTypes';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import { RefreshableScrollView } from '../shared/refresh/RefreshableScrollView';
import { usePageRefresh } from '../shared/refresh/usePageRefresh';
import { prepareMovieImages } from '../utils/movieImageLoading';
import {
  buildHomeSnapshot,
  getHomeSnapshotCollections,
  refreshHomeQueryStates,
  toHomeQueryState,
  type HomeQueryState,
  type HomeSnapshot,
} from './homeLoading';

export function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const isFocused = useIsFocused();
  const { openMovieDetail } = useDetailNavigation();
  const upcomingMoviesQuery = useUpcomingMoviesQuery();
  const popularMoviesQuery = usePopularMoviesQuery();
  const streamingMoviesQuery = useStreamingMoviesQuery();
  const familyMoviesQuery = useHomeGenreMoviesQuery('familyMovies', 10751);
  const comedyMoviesQuery = useHomeGenreMoviesQuery('comedyMovies', 35);
  const dramaMoviesQuery = useHomeGenreMoviesQuery('dramaMovies', 18);
  const crimeMoviesQuery = useHomeGenreMoviesQuery('crimeMovies', 80);
  const horrorMoviesQuery = useHomeGenreMoviesQuery('horrorMovies', 27);
  const musicMoviesQuery = useHomeGenreMoviesQuery('musicMovies', 10402);
  const documentaryMoviesQuery = useHomeGenreMoviesQuery(
    'documentaryMovies',
    99,
  );
  const refetchUpcomingMovies = upcomingMoviesQuery.refetch;
  const refetchPopularMovies = popularMoviesQuery.refetch;
  const refetchStreamingMovies = streamingMoviesQuery.refetch;
  const refetchFamilyMovies = familyMoviesQuery.refetch;
  const refetchComedyMovies = comedyMoviesQuery.refetch;
  const refetchDramaMovies = dramaMoviesQuery.refetch;
  const refetchCrimeMovies = crimeMoviesQuery.refetch;
  const refetchHorrorMovies = horrorMoviesQuery.refetch;
  const refetchMusicMovies = musicMoviesQuery.refetch;
  const refetchDocumentaryMovies = documentaryMoviesQuery.refetch;
  const [homeSnapshot, setHomeSnapshot] = useState<HomeSnapshot | null>(null);
  const [isRebuildingHome, setIsRebuildingHome] = useState(false);
  const [imageRefreshGeneration, setImageRefreshGeneration] = useState(0);
  const initialPreparationRef = useRef<Promise<HomeSnapshot> | null>(null);
  const homeQueryStates = useMemo<HomeQueryState[]>(
    () => [
      toHomeQueryState(upcomingMoviesQuery),
      toHomeQueryState(popularMoviesQuery),
      toHomeQueryState(streamingMoviesQuery),
      toHomeQueryState(familyMoviesQuery),
      toHomeQueryState(comedyMoviesQuery),
      toHomeQueryState(dramaMoviesQuery),
      toHomeQueryState(crimeMoviesQuery),
      toHomeQueryState(horrorMoviesQuery),
      toHomeQueryState(musicMoviesQuery),
      toHomeQueryState(documentaryMoviesQuery),
    ],
    [
      comedyMoviesQuery,
      crimeMoviesQuery,
      documentaryMoviesQuery,
      dramaMoviesQuery,
      familyMoviesQuery,
      horrorMoviesQuery,
      musicMoviesQuery,
      popularMoviesQuery,
      streamingMoviesQuery,
      upcomingMoviesQuery,
    ],
  );
  const initialQueriesHaveSettled = homeQueryStates.every(
    query => !query.isLoading,
  );

  useEffect(() => {
    if (
      homeSnapshot ||
      isRebuildingHome ||
      !initialQueriesHaveSettled
    ) {
      return;
    }

    let isCancelled = false;
    if (!initialPreparationRef.current) {
      const nextSnapshot = buildHomeSnapshot(homeQueryStates);

      initialPreparationRef.current = prepareMovieImages(
        getHomeSnapshotCollections(nextSnapshot),
      ).then(() => nextSnapshot);
    }

    void initialPreparationRef.current.then(nextSnapshot => {
      if (!isCancelled) {
        setHomeSnapshot(nextSnapshot);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    homeQueryStates,
    homeSnapshot,
    initialQueriesHaveSettled,
    isRebuildingHome,
  ]);

  const refreshHome = useCallback(async () => {
    // Removing the snapshot unmounts every Home section immediately. The page
    // then follows the same sequence as its first visit: request every Home
    // collection together, prepare their posters, and publish one full snapshot.
    setIsRebuildingHome(true);
    initialPreparationRef.current = null;
    setHomeSnapshot(null);

    try {
      const nextQueryStates = await refreshHomeQueryStates(homeQueryStates, [
        refetchUpcomingMovies,
        refetchPopularMovies,
        refetchStreamingMovies,
        refetchFamilyMovies,
        refetchComedyMovies,
        refetchDramaMovies,
        refetchCrimeMovies,
        refetchHorrorMovies,
        refetchMusicMovies,
        refetchDocumentaryMovies,
      ]);
      const nextSnapshot = buildHomeSnapshot(nextQueryStates);

      await prepareMovieImages(getHomeSnapshotCollections(nextSnapshot));
      setHomeSnapshot(nextSnapshot);
      setImageRefreshGeneration(currentGeneration => currentGeneration + 1);
    } finally {
      setIsRebuildingHome(false);
    }
  }, [
    homeQueryStates,
    refetchComedyMovies,
    refetchCrimeMovies,
    refetchDocumentaryMovies,
    refetchDramaMovies,
    refetchFamilyMovies,
    refetchHorrorMovies,
    refetchMusicMovies,
    refetchPopularMovies,
    refetchStreamingMovies,
    refetchUpcomingMovies,
  ]);
  const pageRefresh = usePageRefresh(refreshHome);
  const moviePosterRows = homeSnapshot
    ? HOME_ADVANCED_SEARCH_SECTIONS.map(section => ({
        ...section,
        query: homeSnapshot.rows[section.id],
      }))
    : [];

  function handleOpenDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function handleOpenTitleSearch() {
    navigation.navigate('SearchByMovieTitle', { returnTo: 'Home' });
  }

  function handleOpenAdvancedSearchSection(
    homeSectionId: HomeAdvancedSearchSectionId,
  ) {
    navigation.navigate('AdvancedSearch', {
      homeSectionId,
      presetRequestId: `${homeSectionId}:${Date.now()}`,
    });
  }

  if (!homeSnapshot) {
    return (
      <View style={styles.preparingHome}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RefreshableScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        directionalLockEnabled
        {...pageRefresh}
      >
        <View style={styles.heroStage}>
          <HomeHeroCarousel
            movies={homeSnapshot.upcoming.data}
            isLoading={false}
            isError={homeSnapshot.upcoming.isError}
            error={homeSnapshot.upcoming.error}
            isAutoPlayPaused={!isFocused}
            imageRefreshGeneration={imageRefreshGeneration}
            onMoviePress={openMovieDetail}
          />
          <HeaderActionRow
            left={
              <HeaderNavButton
                variant="menu"
                anchored={false}
                onPress={handleOpenDrawer}
              />
            }
            right={
              <HeaderNavButton
                variant="search"
                anchored={false}
                onPress={handleOpenTitleSearch}
                color={colors.actionOnPrimary}
              />
            }
          />
        </View>

        {moviePosterRows.map(row => (
          <HomeMoviePosterRow
            key={row.title}
            title={row.title}
            movies={row.query.data}
            isLoading={false}
            isError={row.query.isError}
            imageRefreshGeneration={imageRefreshGeneration}
            onMoviePress={openMovieDetail}
            onTitlePress={() => handleOpenAdvancedSearchSection(row.id)}
          />
        ))}
      </RefreshableScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  preparingHome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: scaleSize(24),
  },
  heroStage: {
    position: 'relative',
    backgroundColor: '#d9d9d9',
  },
});
