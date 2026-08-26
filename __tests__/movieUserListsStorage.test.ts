import AsyncStorage from '@react-native-async-storage/async-storage';
import type { movieType } from '../src/types/movie/MovieTypes';
import {
  getStoredMovieListData,
  parseStoredMovieListData,
  removeMovieFromStoredList,
  saveMovieToStoredList,
  saveRefreshedStoredMovieList,
  storedMovieHasCompleteCardData,
  toStoredMovieListItem,
} from '../src/utils/storage/movieUserListsStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

function movie(id: number, imdbRating = 7): movieType {
  return {
    id,
    adult: false,
    backdrop_path: '',
    genres: [],
    original_language: 'en',
    original_title: `Movie ${id}`,
    overview: '',
    popularity: 0,
    poster_path: '',
    release_date: '2026-01-01',
    title: `Movie ${id}`,
    video: false,
    vote_average: imdbRating,
    vote_count: 0,
    imdb_rating: imdbRating,
    available_with_subscription: true,
    available_without_rent_or_purchase: true,
    genreIds: [],
    budget: 0,
    revenue: 0,
    runtime: 0,
    credits: { cast: [], crew: [] },
    release_dates: { results: [] },
    videos: { results: [] },
    production_companies: [],
    production_countries: [],
  };
}

describe('Favorites and Seen local storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('reads the old movie-array format with no completed refresh date', () => {
    const oldStoredMovie = toStoredMovieListItem(movie(1));

    expect(parseStoredMovieListData(JSON.stringify([oldStoredMovie]))).toEqual({
      movies: [oldStoredMovie],
      cardDataRefreshedLocalDate: null,
    });
  });

  test('persists IMDb and availability answers in the one saved-list record', async () => {
    const refreshedMovies = [movie(2, 8), movie(1, 7)];
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(
      JSON.stringify({
        movies: refreshedMovies.map(toStoredMovieListItem),
        cardDataRefreshedLocalDate: null,
      }),
    );

    await expect(
      saveRefreshedStoredMovieList(
        'movieFavoritesData',
        refreshedMovies,
        '2026-08-25',
      ),
    ).resolves.toBe(true);

    const savedData = JSON.parse(
      jest.mocked(AsyncStorage.setItem).mock.calls[0][1],
    );

    expect(savedData.cardDataRefreshedLocalDate).toBe('2026-08-25');
    expect(
      savedData.movies.map((savedMovie: { id: number }) => savedMovie.id),
    ).toEqual([2, 1]);
    expect(savedData.movies[0]).toMatchObject({
      imdb_rating: 8,
      available_with_subscription: true,
      available_without_rent_or_purchase: true,
    });
  });

  test('preserves the refresh date when a movie is added or removed', async () => {
    const firstMovie = toStoredMovieListItem(movie(1));
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(
      JSON.stringify({
        movies: [firstMovie],
        cardDataRefreshedLocalDate: '2026-08-25',
      }),
    );

    await saveMovieToStoredList(
      'movieSeenData',
      toStoredMovieListItem({
        ...movie(2),
        imdb_rating: undefined,
        available_with_subscription: undefined,
        available_without_rent_or_purchase: undefined,
      }),
    );
    const afterAdd = JSON.parse(
      jest.mocked(AsyncStorage.setItem).mock.calls[0][1],
    );

    expect(afterAdd.cardDataRefreshedLocalDate).toBe('2026-08-25');
    expect(
      afterAdd.movies.map((savedMovie: { id: number }) => savedMovie.id),
    ).toEqual([1, 2]);
    expect(storedMovieHasCompleteCardData(afterAdd.movies[1])).toBe(false);

    jest
      .mocked(AsyncStorage.getItem)
      .mockResolvedValue(JSON.stringify(afterAdd));
    await removeMovieFromStoredList('movieSeenData', 1);
    const afterRemove = JSON.parse(
      jest.mocked(AsyncStorage.setItem).mock.calls[1][1],
    );

    expect(afterRemove.cardDataRefreshedLocalDate).toBe('2026-08-25');
    expect(
      afterRemove.movies.map((savedMovie: { id: number }) => savedMovie.id),
    ).toEqual([2]);
  });

  test('does not overwrite an add or remove that happened during refresh', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(
      JSON.stringify({
        movies: [toStoredMovieListItem(movie(1))],
        cardDataRefreshedLocalDate: '2026-08-25',
      }),
    );

    await expect(
      saveRefreshedStoredMovieList(
        'movieFavoritesData',
        [movie(1), movie(2)],
        '2026-08-25',
      ),
    ).resolves.toBe(false);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('reads the new one-record format', async () => {
    const savedData = {
      movies: [toStoredMovieListItem(movie(1))],
      cardDataRefreshedLocalDate: '2026-08-25',
    };
    jest
      .mocked(AsyncStorage.getItem)
      .mockResolvedValue(JSON.stringify(savedData));

    await expect(getStoredMovieListData('movieFavoritesData')).resolves.toEqual(
      savedData,
    );
  });
});
