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
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  DrawerActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import {
  useHomeGenreMoviesQuery,
  usePopularMoviesQuery,
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

export function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const isFocused = useIsFocused();
  const { openMovieDetail } = useDetailNavigation();
  const upcomingMoviesQuery = useUpcomingMoviesQuery();
  const popularMoviesQuery = usePopularMoviesQuery();
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
  const refetchFamilyMovies = familyMoviesQuery.refetch;
  const refetchComedyMovies = comedyMoviesQuery.refetch;
  const refetchDramaMovies = dramaMoviesQuery.refetch;
  const refetchCrimeMovies = crimeMoviesQuery.refetch;
  const refetchHorrorMovies = horrorMoviesQuery.refetch;
  const refetchMusicMovies = musicMoviesQuery.refetch;
  const refetchDocumentaryMovies = documentaryMoviesQuery.refetch;
  const moviePosterRows = HOME_ADVANCED_SEARCH_SECTIONS.map(section => ({
    ...section,
    query: {
      popular: popularMoviesQuery,
      family: familyMoviesQuery,
      comedy: comedyMoviesQuery,
      drama: dramaMoviesQuery,
      crime: crimeMoviesQuery,
      horror: horrorMoviesQuery,
      music: musicMoviesQuery,
      documentary: documentaryMoviesQuery,
    }[section.id],
  }));
  const refreshHome = useCallback(async () => {
    await Promise.allSettled([
      refetchUpcomingMovies(),
      refetchPopularMovies(),
      refetchFamilyMovies(),
      refetchComedyMovies(),
      refetchDramaMovies(),
      refetchCrimeMovies(),
      refetchHorrorMovies(),
      refetchMusicMovies(),
      refetchDocumentaryMovies(),
    ]);
  }, [
    refetchComedyMovies,
    refetchCrimeMovies,
    refetchDocumentaryMovies,
    refetchDramaMovies,
    refetchFamilyMovies,
    refetchHorrorMovies,
    refetchMusicMovies,
    refetchPopularMovies,
    refetchUpcomingMovies,
  ]);
  const pageRefresh = usePageRefresh(refreshHome);

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

  return (
    <View style={styles.container}>
      <RefreshableScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        directionalLockEnabled
        nestedScrollEnabled
        {...pageRefresh}
      >
        <View style={styles.heroStage}>
          <HomeHeroCarousel
            movies={upcomingMoviesQuery.data}
            isLoading={upcomingMoviesQuery.isLoading}
            isError={upcomingMoviesQuery.isError}
            error={upcomingMoviesQuery.error}
            isAutoPlayPaused={!isFocused}
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
            isLoading={row.query.isLoading}
            isError={row.query.isError}
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
