import { tmdbClient } from '../src/api/tmdb/client';
import { CONFIG } from '../src/api/tmdb/config';
import {
  fetchMovie,
  fetchMovieExternalIds,
  fetchMovieVideos,
  fetchMovieWatchProviders,
  fetchPerson,
  fetchPersonMovieCredits,
} from '../src/api/tmdb/services/movieService';

jest.mock('../src/api/tmdb/client', () => ({
  tmdbClient: {
    get: jest.fn(),
  },
}));

const mockedGet = tmdbClient.get as jest.MockedFunction<typeof tmdbClient.get>;

describe('TMDB detail service boundaries', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue({ data: {} });
  });

  test('movie detail uses the legacy core request and three dedicated resources', async () => {
    const movieId = 840464;

    await Promise.all([
      fetchMovie(movieId),
      fetchMovieVideos(movieId),
      fetchMovieExternalIds(movieId),
      fetchMovieWatchProviders(movieId),
    ]);

    expect(mockedGet.mock.calls.map(([path]) => path)).toEqual([
      `/movie/${movieId}?${CONFIG.apiKey}&append_to_response=credits,release_dates`,
      `/movie/${movieId}/videos?${CONFIG.apiKey}`,
      `/movie/${movieId}/external_ids?${CONFIG.apiKey}`,
      `/movie/${movieId}/watch/providers?${CONFIG.apiKey}`,
    ]);

    expect(mockedGet.mock.calls.map(([path]) => String(path))).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'append_to_response=credits,release_dates,watch/providers,videos,external_ids',
        ),
      ]),
    );
  });

  test('actor profile uses separate person and movie-credit requests', async () => {
    const personId = 54882;

    await Promise.all([
      fetchPerson(personId),
      fetchPersonMovieCredits(personId),
    ]);

    expect(mockedGet.mock.calls.map(([path]) => path)).toEqual([
      `/person/${personId}?${CONFIG.apiKey}`,
      `/person/${personId}/movie_credits?${CONFIG.apiKey}`,
    ]);

    expect(mockedGet.mock.calls.map(([path]) => String(path))).not.toEqual(
      expect.arrayContaining([expect.stringContaining('append_to_response=')]),
    );
  });
});
