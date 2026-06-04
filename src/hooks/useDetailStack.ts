import { useCallback, useState } from 'react';
import type { movieType } from '../types/movie/MovieTypes';
import type { DetailStackEntry } from '../types/navigation/detailStackTypes';

export function useDetailStack() {
  const [detailStack, setDetailStack] = useState<DetailStackEntry[]>([]);

  const pushMovie = useCallback((movie: movieType) => {
    setDetailStack(currentStack => [
      ...currentStack,
      {
        type: 'movie',
        movieId: movie.id,
        initialMovie: movie,
        title: movie.title,
      },
    ]);
  }, []);

  const pushMovieById = useCallback((movieId: number, title?: string) => {
    setDetailStack(currentStack => [
      ...currentStack,
      {
        type: 'movie',
        movieId,
        initialMovie: null,
        title,
      },
    ]);
  }, []);

  const pushPerson = useCallback((personId: number, initialPersonName?: string) => {
    setDetailStack(currentStack => [
      ...currentStack,
      {
        type: 'person',
        personId,
        initialPersonName,
      },
    ]);
  }, []);

  const popDetail = useCallback(() => {
    setDetailStack(currentStack => currentStack.slice(0, -1));
  }, []);

  const closeAllDetails = useCallback(() => {
    setDetailStack([]);
  }, []);

  return {
    detailStack,
    isDetailStackOpen: detailStack.length > 0,
    pushMovie,
    pushMovieById,
    pushPerson,
    popDetail,
    closeAllDetails,
  };
}
