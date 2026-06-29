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
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import { useDetailNavigation } from '../hooks/useDetailNavigation';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';

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
  const moviePosterRows = [
    { title: 'Popular Movies', query: popularMoviesQuery },
    { title: 'Family Movies', query: familyMoviesQuery },
    { title: 'Comedy Movies', query: comedyMoviesQuery },
    { title: 'Drama Movies', query: dramaMoviesQuery },
    { title: 'Crime Movies', query: crimeMoviesQuery },
    { title: 'Horror Movies', query: horrorMoviesQuery },
    { title: 'Music Movies', query: musicMoviesQuery },
    { title: 'Documentary Movies', query: documentaryMoviesQuery },
  ];

  function handleOpenDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function handleOpenTitleSearch() {
    navigation.navigate('SearchByMovieTitle', { returnTo: 'Home' });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          />
        ))}
      </ScrollView>
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
