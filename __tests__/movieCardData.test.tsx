import React from 'react';
import { Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import {
  fetchMovieCardData,
  fetchMovieCardDataBatch,
} from '../src/api/tmdb/services/movieService';
import { MovieCard } from '../src/search/results/MovieCard';
import type { movieType } from '../src/types/movie/MovieTypes';
import { loadMovieCardDataForMovies } from '../src/utils/storage/movieCardData';
import { colors } from '../src/theme/colors';
import { scaleSize } from '../src/theme/scale';

const originalFetch = globalThis.fetch;

function makeMovie(id: number, title: string) {
  return {
    id,
    adult: false,
    backdrop_path: '',
    genres: [],
    original_language: 'en',
    original_title: title,
    overview: '',
    popularity: 0,
    poster_path: '',
    release_date: '2026-01-01',
    title,
    video: false,
    vote_average: 0,
    vote_count: 0,
    genreIds: [],
    budget: 0,
    revenue: 0,
    runtime: 0,
    credits: { cast: [], crew: [] },
    release_dates: { results: [] },
    videos: { results: [] },
    production_companies: [],
    production_countries: [],
  } satisfies movieType;
}

describe('movie card data', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('requests the combined IMDb and viewing-option endpoint', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        tmdb_id: 603,
        imdb_rating: 8.7,
        available_with_subscription: true,
        available_without_rent_or_purchase: true,
      }),
    })) as jest.Mock;

    await expect(fetchMovieCardData(603)).resolves.toEqual({
      tmdb_id: 603,
      imdb_rating: 8.7,
      available_with_subscription: true,
      available_without_rent_or_purchase: true,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies/603/card-data',
    );
  });

  test('adds both card answers while preserving IMDb rating order', async () => {
    globalThis.fetch = jest.fn(
      async (_request: string, options: RequestInit) => {
        const requestedMovieIds = JSON.parse(options.body as string)
          .tmdb_ids as number[];

        return {
          ok: true,
          json: async () => ({
            results: requestedMovieIds.map(movieId => ({
              tmdb_id: movieId,
              imdb_rating: movieId === 101 ? 5.5 : 8.2,
              available_with_subscription: movieId !== 101,
              available_without_rent_or_purchase: movieId === 101,
            })),
          }),
        };
      },
    ) as jest.Mock;

    const movies = await loadMovieCardDataForMovies([
      makeMovie(101, 'Lower rated'),
      makeMovie(202, 'Higher rated'),
    ]);

    expect(movies.map(movie => movie.id)).toEqual([202, 101]);
    expect(movies[0]).toMatchObject({
      imdb_rating: 8.2,
      vote_average: 8.2,
      available_with_subscription: true,
      available_without_rent_or_purchase: false,
    });
    expect(movies[1]).toMatchObject({
      imdb_rating: 5.5,
      vote_average: 5.5,
      available_with_subscription: false,
      available_without_rent_or_purchase: true,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies/card-data/batch',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tmdb_ids: [101, 202] }),
      }),
    );
  });

  test('loads 120 movies as three batches of at most 50 IDs', async () => {
    globalThis.fetch = jest.fn(
      async (_request: string, options: RequestInit) => {
        const requestedMovieIds = JSON.parse(options.body as string)
          .tmdb_ids as number[];

        return {
          ok: true,
          json: async () => ({
            results: requestedMovieIds.map(movieId => ({
              tmdb_id: movieId,
              imdb_rating: movieId / 100,
              available_with_subscription: false,
              available_without_rent_or_purchase: false,
            })),
          }),
        };
      },
    ) as jest.Mock;

    const movies = Array.from({ length: 120 }, (_, index) =>
      makeMovie(index + 1, `Movie ${index + 1}`),
    );
    const loadedMovies = await loadMovieCardDataForMovies(movies);
    const batchSizes = jest
      .mocked(globalThis.fetch)
      .mock.calls.map(
        ([, options]) =>
          JSON.parse((options as RequestInit).body as string).tmdb_ids.length,
      );

    expect(batchSizes).toEqual([50, 50, 20]);
    expect(loadedMovies).toHaveLength(120);
    expect(loadedMovies[0].id).toBe(120);
  });

  test('retries one failed batch once and then returns its answers', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('temporary network failure'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              tmdb_id: 303,
              imdb_rating: 7.7,
              available_with_subscription: true,
              available_without_rent_or_purchase: true,
            },
          ],
        }),
      }) as jest.Mock;

    await expect(
      loadMovieCardDataForMovies([makeMovie(303, 'Retry movie')]),
    ).resolves.toMatchObject([{ id: 303, imdb_rating: 7.7 }]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  test('fails the refresh after the same batch fails twice', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network unavailable')) as jest.Mock;

    await expect(
      loadMovieCardDataForMovies([makeMovie(404, 'Unavailable movie')]),
    ).rejects.toThrow('network unavailable');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  test('rejects a malformed batch response', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ movies: [] }),
    })) as jest.Mock;

    await expect(fetchMovieCardDataBatch([603])).rejects.toThrow(
      'Cloudflare movie card batch response was malformed.',
    );
  });

  test.each([
    { answer: false, expectedBadgeCount: 1 },
    { answer: true, expectedBadgeCount: 0 },
    { answer: null, expectedBadgeCount: 0 },
    { answer: undefined, expectedBadgeCount: 0 },
  ])(
    'shows the bag only for a confirmed false answer: $answer',
    ({ answer, expectedBadgeCount }) => {
      const movie = {
        ...makeMovie(303, 'Subscription test'),
        available_without_rent_or_purchase: answer,
      };
      let component!: TestRenderer.ReactTestRenderer;

      act(() => {
        component = TestRenderer.create(
          <MovieCard
            movie={movie}
            variant="posterRating"
            onPress={() => undefined}
          />,
        );
      });

      expect(
        component.root.findAll(
          node =>
            node.type === View &&
            node.props.testID === 'rent-or-purchase-required-badge',
        ),
      ).toHaveLength(expectedBadgeCount);

      act(() => component.unmount());
    },
  );

  test('matches the missing-poster artwork lettering for the overlaid movie title', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <MovieCard
          movie={makeMovie(404, 'A Movie Without a Poster')}
          variant="posterRating"
          onPress={() => undefined}
        />,
      );
    });

    const titleOverlay = component.root.find(
      node => node.props.testID === 'missing-poster-title',
    );
    const titleText = titleOverlay.findByType(Text);

    expect(titleText.props.children).toBe('A Movie Without a Poster');
    expect(titleText.props.style.color).toBe(colors.brandText);
    expect(titleText.props.style.fontSize).toBe(scaleSize(20));
    expect(titleText.props.style.fontWeight).toBe('400');
    expect(titleOverlay.props.style.backgroundColor).toBeUndefined();

    act(() => component.unmount());
  });

  test('does not place the missing-poster title over a real poster', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <MovieCard
          movie={{
            ...makeMovie(405, 'Movie With a Poster'),
            poster_path: '/movie-with-a-poster.jpg',
          }}
          variant="posterRating"
          onPress={() => undefined}
        />,
      );
    });

    expect(
      component.root.findAll(
        node => node.props.testID === 'missing-poster-title',
      ),
    ).toHaveLength(0);

    act(() => component.unmount());
  });

  test('uses the original title when a missing-poster movie has no display title', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <MovieCard
          movie={{
            ...makeMovie(406, ''),
            original_title: 'Original Missing-Poster Title',
          }}
          variant="posterRating"
          onPress={() => undefined}
        />,
      );
    });

    const titleBanner = component.root.find(
      node => node.props.testID === 'missing-poster-title',
    );
    expect(titleBanner.findByType(Text).props.children).toBe(
      'Original Missing-Poster Title',
    );

    act(() => component.unmount());
  });
});
