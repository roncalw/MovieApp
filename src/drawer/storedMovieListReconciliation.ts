import type { movieType } from '../types/movie/MovieTypes';
import type { StoredMovieListItem } from '../types/movie/movieUserListTypes';

export type StoredMovieListMembershipChanges = {
  addedStoredMovies: StoredMovieListItem[];
  removedMovieIds: Set<number>;
};

/**
 * Compare only list membership when Favorites or Seen becomes visible again.
 * The already rendered cards contain the IMDb and availability information we
 * need, so unchanged IDs must not trigger another full card-data download.
 */
export function findStoredMovieListMembershipChanges(
  currentMovies: movieType[],
  storedMovies: StoredMovieListItem[],
): StoredMovieListMembershipChanges {
  const currentMovieIds = new Set(currentMovies.map(movie => movie.id));
  const storedMovieIds = new Set(storedMovies.map(movie => movie.id));

  return {
    addedStoredMovies: storedMovies.filter(
      movie => !currentMovieIds.has(movie.id),
    ),
    removedMovieIds: new Set(
      currentMovies
        .filter(movie => !storedMovieIds.has(movie.id))
        .map(movie => movie.id),
    ),
  };
}
