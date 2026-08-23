import { tmdbClient } from '../src/api/tmdb/client';
import {
  fetchMovieSearchResults,
  fetchStreamingMovies,
} from '../src/api/tmdb/services/movieService';
import { HOME_ADVANCED_SEARCH_SECTIONS } from '../src/home/homeAdvancedSearchSections';
import { ALL_MOVIE_STREAMER_PROVIDER_IDS } from '../src/search/shared/movieStreamers';

jest.mock('../src/api/tmdb/client', () => ({
  tmdbClient: {
    get: jest.fn(),
  },
}));

const mockedGet = tmdbClient.get as jest.MockedFunction<typeof tmdbClient.get>;
const originalFetch = globalThis.fetch;

describe('Streaming Now Home section', () => {
  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  test('sits between Popular Movies and Family Movies and opens the all-streamers popularity preset', () => {
    expect(
      HOME_ADVANCED_SEARCH_SECTIONS.slice(0, 3).map(section => section.title),
    ).toEqual(['Popular Movies', 'Streaming Now', 'Family Movies']);

    const streamingSection = HOME_ADVANCED_SEARCH_SECTIONS[1];

    expect(streamingSection).toMatchObject({
      id: 'streaming',
      advancedSearchParams: {
        movieRatings: '',
        movieGenres: [],
        movieVoteCount: '',
        movieSortBy: 'popularity.desc',
      },
    });
    expect(streamingSection.advancedSearchParams.movieStreamers).toEqual(
      ALL_MOVIE_STREAMER_PROVIDER_IDS,
    );
  });

  test('asks TMDb for any supported US subscription streamer in popularity order', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      },
    });

    await fetchStreamingMovies();

    const requestPath = mockedGet.mock.calls[0][0];
    const searchParams = new URLSearchParams(requestPath.split('?')[1]);

    expect(requestPath).toContain('/discover/movie?');
    expect(searchParams.get('sort_by')).toBe('popularity.desc');
    expect(searchParams.get('watch_region')).toBe('US');
    expect(searchParams.get('with_watch_monetization_types')).toBe('flatrate');
    expect(searchParams.get('with_watch_providers')?.split('|')).toEqual(
      ALL_MOVIE_STREAMER_PROVIDER_IDS,
    );
  });

  test('turns the all-streamers preset into the existing subscription-only Worker search', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ movies: [], nextCursor: null }),
    })) as jest.Mock;

    await fetchMovieSearchResults(
      {
        movieRatings: '',
        beginDate: '2021-01-01',
        endDate: '2026-12-31',
        movieGenres: [],
        movieStreamers: [...ALL_MOVIE_STREAMER_PROVIDER_IDS],
        movieOriginalLanguages: ['en'],
        movieVoteCount: '',
        movieSortBy: 'popularity.desc',
      },
      null,
    );

    const requestUrl = String(jest.mocked(globalThis.fetch).mock.calls[0][0]);
    const searchParams = new URL(requestUrl).searchParams;

    expect(searchParams.get('watchMonetizationTypes')).toBe('flatrate');
    expect(searchParams.get('sort')).toBe('popularity');
    expect(searchParams.has('providerIds')).toBe(false);
  });
});
