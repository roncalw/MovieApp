import React from 'react';
import { View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { fetchMovieCardData } from '../src/api/tmdb/services/movieService';
import { MovieCard } from '../src/search/results/MovieCard';
import type { movieType } from '../src/types/movie/MovieTypes';
import { loadMovieCardDataForMovies } from '../src/utils/storage/movieCardData';

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
    globalThis.fetch = jest.fn(async (request: string) => {
      const isFirstMovie = request.includes('/101/');

      return {
        ok: true,
        json: async () => ({
          tmdb_id: isFirstMovie ? 101 : 202,
          imdb_rating: isFirstMovie ? 5.5 : 8.2,
          available_with_subscription: !isFirstMovie,
          available_without_rent_or_purchase: isFirstMovie,
        }),
      };
    }) as jest.Mock;

    const movies = await loadMovieCardDataForMovies([
      makeMovie(101, 'Lower rated'),
      makeMovie(202, 'Higher rated'),
    ]);

    expect(movies.map(movie => movie.id)).toEqual([202, 101]);
    expect(movies[0]).toMatchObject({
      vote_average: 8.2,
      available_with_subscription: true,
      available_without_rent_or_purchase: false,
    });
    expect(movies[1]).toMatchObject({
      vote_average: 5.5,
      available_with_subscription: false,
      available_without_rent_or_purchase: true,
    });
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
});
