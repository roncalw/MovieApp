import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { MovieResults } from '../search/results/MovieResults';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import { useDetailNavigation } from '../hooks/useDetailNavigation';
import { drawerScreenStyles as styles } from '../styles/drawer/drawerScreenStyles';
import { hydrateMoviesWithCurrentImdbRatings } from '../utils/storage/movieListRatingHydration';
import {
  getStoredMovieList,
  storedMovieToMovieType,
} from '../utils/storage/movieUserListsStorage';
import type { movieType } from '../types/movie/MovieTypes';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import type { StoredMovieListScreenProps } from '../types/drawer/drawerScreenTypes';

export function StoredMovieListScreen({
  title,
  emptyMessage,
  storageKey,
}: StoredMovieListScreenProps) {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { openMovieDetail } = useDetailNavigation();
  const [movies, setMovies] = useState<movieType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadMovies = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedMovies = await getStoredMovieList(storageKey);
      const hydratedMovies = await hydrateMoviesWithCurrentImdbRatings(
        storedMovies.map(storedMovieToMovieType),
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
      loadMovies();
    }, [loadMovies]),
  );

  function handleOpenTitleSearch() {
    navigation.navigate('SearchByMovieTitle', {
      returnTo:
        storageKey === 'movieFavoritesData' ? 'MovieFavorites' : 'IHaveSeen',
    });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <HeaderActionRow
          left={
            <HeaderNavButton
              variant="menu"
              anchored={false}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
          center={
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </Text>
          }
          right={
            <HeaderNavButton
              variant="search"
              anchored={false}
              onPress={handleOpenTitleSearch}
            />
          }
        />
      </View>

      <View style={styles.listContent}>
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
            onMoviePress={openMovieDetail}
          />
        ) : (
          <View style={styles.centered}>
            <Text allowFontScaling={false} style={styles.message}>
              {emptyMessage}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
