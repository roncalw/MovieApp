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

/**
 * Apply only confirmed additions and removals while preserving the existing
 * card objects. This keeps an unchanged list and its native scroll position
 * completely untouched. A removal preserves the existing order without
 * sorting. Only an addition needs to be inserted into IMDb-rating order.
 */
export function reconcileStoredMovieListMembership(
  currentMovies: movieType[],
  storedMovies: StoredMovieListItem[],
  addedMoviesWithCardData: movieType[],
): movieType[] {
  const changes = findStoredMovieListMembershipChanges(
    currentMovies,
    storedMovies,
  );

  if (
    changes.addedStoredMovies.length === 0 &&
    changes.removedMovieIds.size === 0
  ) {
    return currentMovies;
  }

  const storedMovieIds = new Set(storedMovies.map(movie => movie.id));
  const retainedMovies = currentMovies.filter(movie =>
    storedMovieIds.has(movie.id),
  );
  const retainedMovieIds = new Set(retainedMovies.map(movie => movie.id));
  const addedMovies = addedMoviesWithCardData.filter(
    movie => storedMovieIds.has(movie.id) && !retainedMovieIds.has(movie.id),
  );

  if (addedMovies.length === 0) {
    return retainedMovies;
  }

  return [...retainedMovies, ...addedMovies].sort(compareStoredMovieCards);
}

function compareStoredMovieCards(left: movieType, right: movieType) {
  const ratingDifference =
    (right.imdb_rating ?? right.vote_average ?? -1) -
    (left.imdb_rating ?? left.vote_average ?? -1);

  if (ratingDifference !== 0) {
    return ratingDifference;
  }

  return left.title.localeCompare(right.title);
}
