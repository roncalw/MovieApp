/**
 * Native detail navigation for screens hosted by the app drawer.
 *
 * Drawer screens use this hook instead of maintaining a private array of
 * invisible detail overlays. The root native stack owns the transition and
 * keeps the originating drawer screen parked behind the detail screen.
 */
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { movieType } from '../types/movie/MovieTypes';
import type {
  AppDrawerParamList,
  AppRootStackParamList,
} from '../types/navigation/navigationTypes';
import { getMovieDetailsQueryOptions } from './useMovieSearchQuery';

export function useDetailNavigation() {
  const drawerNavigation =
    useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const queryClient = useQueryClient();

  const openMovieDetail = useCallback(
    (movie: movieType) => {
      const rootNavigation =
        drawerNavigation.getParent<
          NativeStackNavigationProp<AppRootStackParamList>
        >();

      if (!rootNavigation) {
        console.error('Unable to find the root navigator for Movie Detail.');
        return;
      }

      void queryClient.prefetchQuery(getMovieDetailsQueryOptions(movie.id));
      rootNavigation.push('MovieDetail', {
        movieId: movie.id,
        initialMovie: movie,
      });
    },
    [drawerNavigation, queryClient],
  );

  return { openMovieDetail };
}
