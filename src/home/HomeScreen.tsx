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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import {
  refreshHomeQueryStates,
  toHomeQueryState,
  type HomeQueryState,
} from './homeLoading';
import { useHomeImagePreparations } from './useHomeImagePreparations';

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
  const [isRebuildingHome, setIsRebuildingHome] = useState(false);
  const [isSecondaryPhaseAllowed, setIsSecondaryPhaseAllowed] =
    useState(false);
  const [homeRefreshGeneration, setHomeRefreshGeneration] = useState(0);
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
  const homeImagePreparations = useHomeImagePreparations(
    homeQueryStates,
    homeRefreshGeneration,
    isSecondaryPhaseAllowed,
  );
  const heroImagePreparation = homeImagePreparations[0];
  const popularImagePreparation = homeImagePreparations[1];
  const isFirstViewportReady =
    heroImagePreparation.isReady && popularImagePreparation.isReady;

  /*
   * Phase one is not complete merely because its data and image promises have
   * resolved. React still needs an opportunity to commit those elements and
   * the native screen still needs an opportunity to paint them.
   *
   * The first animation frame lets the completed hero and Popular row reach
   * the native view hierarchy. The second lets that hierarchy appear on the
   * display. Only then does phase two begin preparing the offscreen rows. This
   * keeps lower-page image work from delaying what the customer can already
   * see, without introducing a timer or changing any movie content.
   */
  useEffect(() => {
    if (
      isRebuildingHome ||
      isSecondaryPhaseAllowed ||
      !isFirstViewportReady
    ) {
      return undefined;
    }

    let secondFrameId: number | undefined;
    const firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(() => {
        setIsSecondaryPhaseAllowed(true);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrameId);

      if (secondFrameId !== undefined) {
        cancelAnimationFrame(secondFrameId);
      }
    };
  }, [
    isFirstViewportReady,
    isRebuildingHome,
    isSecondaryPhaseAllowed,
  ]);

  const refreshHome = useCallback(async () => {
    // A Home refresh intentionally remains a full page rebuild. The existing
    // content is removed while every small movie-data request runs together.
    // Poster preparation then restarts in the same two phases as a first visit,
    // instead of mixing old and refreshed sections on one screen.
    setIsRebuildingHome(true);
    setIsSecondaryPhaseAllowed(false);

    try {
      await refreshHomeQueryStates(homeQueryStates, [
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
      setHomeRefreshGeneration(currentGeneration => currentGeneration + 1);
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
  const handleOpenAdvancedSearchSection = useCallback(
    (homeSectionId: HomeAdvancedSearchSectionId) => {
      navigation.navigate('AdvancedSearch', {
        homeSectionId,
        presetRequestId: `${homeSectionId}:${Date.now()}`,
      });
    },
    [navigation],
  );
  const sectionTitlePressHandlers = useMemo(
    () =>
      new Map(
        HOME_ADVANCED_SEARCH_SECTIONS.map(section => [
          section.id,
          () => handleOpenAdvancedSearchSection(section.id),
        ]),
      ),
    [handleOpenAdvancedSearchSection],
  );
  const moviePosterRows = HOME_ADVANCED_SEARCH_SECTIONS.map(
    (section, index) => ({
      ...section,
      query: homeQueryStates[index + 1],
      imagePreparation: homeImagePreparations[index + 1],
    }),
  );

  function handleOpenDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function handleOpenTitleSearch() {
    navigation.navigate('SearchByMovieTitle', { returnTo: 'Home' });
  }

  if (isRebuildingHome) {
    return (
      <View style={styles.preparingHome}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RefreshableScrollView
        key={homeRefreshGeneration}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        directionalLockEnabled
        {...pageRefresh}
      >
        <View style={styles.heroStage}>
          <HomeHeroCarousel
            movies={upcomingMoviesQuery.data}
            isLoading={
              upcomingMoviesQuery.isLoading || !heroImagePreparation.isReady
            }
            isError={upcomingMoviesQuery.isError}
            error={upcomingMoviesQuery.error}
            isAutoPlayPaused={!isFocused}
            imageRefreshGeneration={homeRefreshGeneration}
            unavailableImageUris={
              heroImagePreparation.unavailableImageUris
            }
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

        {moviePosterRows.map((row, index) =>
          index === 0 || isSecondaryPhaseAllowed ? (
            <HomeMoviePosterRow
              key={row.title}
              title={row.title}
              movies={row.query.data}
              isLoading={
                row.query.isLoading ||
                !heroImagePreparation.isReady ||
                !row.imagePreparation.isReady
              }
              isError={
                heroImagePreparation.isReady &&
                row.imagePreparation.isReady &&
                row.query.isError
              }
              imageRefreshGeneration={homeRefreshGeneration}
              unavailableImageUris={
                row.imagePreparation.unavailableImageUris
              }
              onMoviePress={openMovieDetail}
              onTitlePress={sectionTitlePressHandlers.get(row.id)}
            />
          ) : null,
        )}
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
