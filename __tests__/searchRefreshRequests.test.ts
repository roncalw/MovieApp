import { tmdbClient } from '../src/api/tmdb/client';
import {
  fetchMovieLanguages,
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
      json: async () => ({
        movies: [
          {
            tmdb_id: 1526650,
            poster_path: '/mudborn.jpg',
            imdb_rating: 5.7,
            original_language: 'zh',
            available_with_subscription: false,
            available_without_rent_or_purchase: true,
          },
        ],
        nextCursor: null,
      }),
    })) as jest.Mock;
    const params: MovieSearchParams = {
      movieRatings: '',
      beginDate: '2021-01-01',
      endDate: '2026-01-01',
      movieGenres: [],
      movieStreamers: [],
      movieOriginalLanguages: ['en'],
      movieVoteCount: '0',
      movieSortBy: 'popularity.desc',
    };

    const results = await fetchMovieSearchResults(params, null, {
      bypassCache: true,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/originalLanguages=en.*refreshRequest=123456789/),
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    );
    expect(results.movies[0].original_language).toBe('zh');
    expect(results.movies[0].available_with_subscription).toBe(false);
    expect(results.movies[0].available_without_rent_or_purchase).toBe(true);
  });

  test('loads the English language-name lookup from the Worker', async () => {
    const languages = [
      { code: 'ko', englishName: 'Korean', nativeName: '한국어/조선말' },
    ];
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ languages }),
    })) as jest.Mock;

    await expect(fetchMovieLanguages()).resolves.toEqual({ languages });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies/languages',
    );
  });
});
