import {
  findStoredMovieListMembershipChanges,
  reconcileStoredMovieListMembership,
} from '../src/drawer/storedMovieListReconciliation';
import type { movieType } from '../src/types/movie/MovieTypes';
import type { StoredMovieListItem } from '../src/types/movie/movieUserListTypes';

function movie(id: number, rating: number, title = `Movie ${id}`) {
  return { id, title, vote_average: rating } as movieType;
}

function storedMovie(id: number, title = `Movie ${id}`) {
  return { id, title } as StoredMovieListItem;
}

describe('stored movie list membership reconciliation', () => {
  test('returns the existing list object when no Favorite or Seen ID changed', () => {
    const currentMovies = [movie(1, 8), movie(2, 7)];
    const storedMovies = [storedMovie(1), storedMovie(2)];

    expect(
      reconcileStoredMovieListMembership(currentMovies, storedMovies, []),
    ).toBe(currentMovies);
  });

  test('removes only the movie no longer present in local storage', () => {
    const currentMovies = [movie(1, 8), movie(2, 7), movie(3, 6)];
    const storedMovies = [storedMovie(1), storedMovie(3)];
    const changes = findStoredMovieListMembershipChanges(
      currentMovies,
      storedMovies,
    );

    expect([...changes.removedMovieIds]).toEqual([2]);
    expect(
      reconcileStoredMovieListMembership(currentMovies, storedMovies, []).map(
        currentMovie => currentMovie.id,
      ),
    ).toEqual([1, 3]);
  });

  test('inserts only new movies and preserves the rating order', () => {
    const currentMovies = [movie(1, 8), movie(3, 6)];
    const storedMovies = [storedMovie(1), storedMovie(2), storedMovie(3)];
    const changes = findStoredMovieListMembershipChanges(
      currentMovies,
      storedMovies,
    );

    expect(changes.addedStoredMovies.map(addedMovie => addedMovie.id)).toEqual([
      2,
    ]);
    expect(
      reconcileStoredMovieListMembership(
        currentMovies,
        storedMovies,
        [movie(2, 7)],
      ).map(currentMovie => currentMovie.id),
    ).toEqual([1, 2, 3]);
  });
});
