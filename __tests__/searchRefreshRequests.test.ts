import { tmdbClient } from '../src/api/tmdb/client';
import {
  fetchMovieSearchResults,
  fetchMoviesByTitle,
} from '../src/api/tmdb/services/movieService';
import type { MovieSearchParams } from '../src/types/search/movieSearchParams';

jest.mock('../src/api/tmdb/client', () => ({
  tmdbClient: {
    get: jest.fn(),
  },
}));

const mockedGet = tmdbClient.get as jest.MockedFunction<typeof tmdbClient.get>;
const originalFetch = globalThis.fetch;

describe('search refresh requests', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(123456789);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  test('title refresh uses a unique URL and no-cache headers', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      },
    });

    await fetchMoviesByTitle('Matrix', 1, { bypassCache: true });

    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('&refreshRequest=123456789'),
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    );
  });

  test('advanced refresh uses a unique URL and no-cache headers', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ movies: [], nextCursor: null }),
    })) as jest.Mock;
    const params: MovieSearchParams = {
      movieRatings: '',
      beginDate: '2021-01-01',
      endDate: '2026-01-01',
      movieGenres: [],
      movieStreamers: [],
      movieVoteCount: '0',
      movieSortBy: 'popularity.desc',
    };

    await fetchMovieSearchResults(params, null, { bypassCache: true });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('refreshRequest=123456789'),
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    );
  });
});
