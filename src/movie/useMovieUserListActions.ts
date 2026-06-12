/**
 * Favorite and Seen-list state for Movie Detail.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx uses this hook inside LoadedMovieDetail.
 *
 * Code flow:
 * 1. LoadedMovieDetail passes the current movie into this hook.
 * 2. The hook reads AsyncStorage-backed Favorites and Movies I Have Seen state.
 * 3. Button presses call the returned toggle handlers, which update storage and
 *    immediately update local UI state.
 */

import { useCallback, useEffect, useState } from 'react';
import type { movieType } from '../types/movie/MovieTypes';
import {
  isMovieInStoredList,
  MOVIE_FAVORITES_STORAGE_KEY,
  MOVIE_SEEN_STORAGE_KEY,
  removeMovieFromStoredList,
  saveMovieToStoredList,
  toStoredMovieListItem,
} from '../utils/storage/movieUserListsStorage';

export function useMovieUserListActions(movie: movieType) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSeen, setIsSeen] = useState(false);

  const refreshStoredState = useCallback(async () => {
    const [favoriteState, seenState] = await Promise.all([
      isMovieInStoredList(MOVIE_FAVORITES_STORAGE_KEY, movie.id),
      isMovieInStoredList(MOVIE_SEEN_STORAGE_KEY, movie.id),
    ]);

    setIsFavorite(favoriteState);
    setIsSeen(seenState);
  }, [movie.id]);

  const handleFavoritePress = useCallback(async () => {
    try {
      if (isFavorite) {
        await removeMovieFromStoredList(MOVIE_FAVORITES_STORAGE_KEY, movie.id);
        setIsFavorite(false);
        return;
      }

      await saveMovieToStoredList(
        MOVIE_FAVORITES_STORAGE_KEY,
        toStoredMovieListItem(movie)
      );
      setIsFavorite(true);
    } catch (error) {
      console.warn('Unable to update movie favorite state:', error);
    }
  }, [isFavorite, movie]);

  const handleSeenPress = useCallback(async () => {
    try {
      if (isSeen) {
        await removeMovieFromStoredList(MOVIE_SEEN_STORAGE_KEY, movie.id);
        setIsSeen(false);
        return;
      }

      await saveMovieToStoredList(
        MOVIE_SEEN_STORAGE_KEY,
        toStoredMovieListItem(movie)
      );
      setIsSeen(true);
    } catch (error) {
      console.warn('Unable to update movie seen state:', error);
    }
  }, [isSeen, movie]);

  useEffect(() => {
    refreshStoredState().catch(error => {
      console.warn('Unable to read movie user list state:', error);
    });
  }, [refreshStoredState]);

  return {
    handleFavoritePress,
    handleSeenPress,
    isFavorite,
    isSeen,
  };
}
