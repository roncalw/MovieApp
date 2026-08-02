import React, { useCallback, useState } from 'react';
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
      const moviesWithCardData = await loadMovieCardDataForMovies(
        storedMovies.map(storedMovieToMovieType),
      );

      setMovies(moviesWithCardData);
    } catch (error) {
      console.error(`Error loading ${title}:`, error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, title]);
  const pageRefresh = usePageRefresh(loadMovies);

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
            <>
              {screenHeader}
              {loadingStatus}
            </>
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
