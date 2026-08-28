import { findStoredMovieListMembershipChanges } from '../src/drawer/storedMovieListReconciliation';
import type { movieType } from '../src/types/movie/MovieTypes';
import type { StoredMovieListItem } from '../src/types/movie/movieUserListTypes';

function movie(id: number, title = `Movie ${id}`) {
  return { id, title } as movieType;
}

function storedMovie(id: number, title = `Movie ${id}`) {
  return { id, title } as StoredMovieListItem;
}

describe('stored movie list membership changes', () => {
  test('reports no changes when the Favorite or Seen IDs are unchanged', () => {
    const currentMovies = [movie(1), movie(2)];
    const storedMovies = [storedMovie(1), storedMovie(2)];
    const changes = findStoredMovieListMembershipChanges(
      currentMovies,
      storedMovies,
    );

    expect(changes.addedStoredMovies).toEqual([]);
    expect([...changes.removedMovieIds]).toEqual([]);
  });

  test('reports only the movie no longer present in local storage', () => {
    const currentMovies = [movie(1), movie(2), movie(3)];
    const storedMovies = [storedMovie(1), storedMovie(3)];
    const changes = findStoredMovieListMembershipChanges(
      currentMovies,
      storedMovies,
    );

    expect([...changes.removedMovieIds]).toEqual([2]);
    expect(changes.addedStoredMovies).toEqual([]);
  });

  test('reports only movies newly added to local storage', () => {
    const currentMovies = [movie(1), movie(3)];
    const storedMovies = [storedMovie(1), storedMovie(2), storedMovie(3)];
    const changes = findStoredMovieListMembershipChanges(
      currentMovies,
      storedMovies,
    );

    expect(changes.addedStoredMovies.map(addedMovie => addedMovie.id)).toEqual([
      2,
    ]);
    expect([...changes.removedMovieIds]).toEqual([]);
  });
});
