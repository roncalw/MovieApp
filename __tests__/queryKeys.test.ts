import { queryKeys } from '../src/query/queryKeys';

describe('queryKeys', () => {
  test('keeps search reset roots aligned with individual search caches', () => {
    const movieParams = {
      movieRatings: '',
      beginDate: '2020-01-01',
      endDate: '2026-12-31',
      movieGenres: [],
      movieStreamers: [],
      movieOriginalLanguages: ['en'],
      movieVoteCount: '',
      movieSortBy: '',
    };

    expect(queryKeys.movieSearch(movieParams).slice(0, 1)).toEqual(
      queryKeys.movieSearchRoot,
    );
    expect(queryKeys.movieTitleSearch('Alien').slice(0, 1)).toEqual(
      queryKeys.movieTitleSearchRoot,
    );
  });

  test('normalizes original-language order in the movie-search cache key', () => {
    const baseParams = {
      movieRatings: '',
      beginDate: '2020-01-01',
      endDate: '2026-12-31',
      movieGenres: [],
      movieStreamers: [],
      movieVoteCount: '',
      movieSortBy: '',
    };

    expect(
      queryKeys.movieSearch({
        ...baseParams,
        movieOriginalLanguages: [' KO ', 'en', 'ko'],
      }),
    ).toEqual(
      queryKeys.movieSearch({
        ...baseParams,
        movieOriginalLanguages: ['en', 'ko'],
      }),
    );
  });

  test('gives each movie detail resource its own cache key', () => {
    const movieId = 550;
    const detailKeys = [
      queryKeys.movieCoreDetails(movieId),
      queryKeys.movieVideos(movieId),
      queryKeys.movieExternalIds(movieId),
      queryKeys.movieWatchProviders(movieId),
      queryKeys.movieListImdbRating(movieId),
    ];

    expect(new Set(detailKeys.map(key => key[0])).size).toBe(detailKeys.length);
  });
});
