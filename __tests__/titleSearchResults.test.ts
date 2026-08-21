import { tmdbClient } from '../src/api/tmdb/client';
import { fetchMovieTitleSearchResults } from '../src/api/tmdb/services/movieService';
import { rankTitleSearchMovies } from '../src/search/title/titleSearchResults';
import type { movieType } from '../src/types/movie/MovieTypes';

jest.mock('../src/api/tmdb/client', () => ({
  tmdbClient: {
    get: jest.fn(),
  },
}));

const mockedGet = tmdbClient.get as jest.MockedFunction<typeof tmdbClient.get>;

function makeMovie(id: number, title: string, popularity: number): movieType {
  return {
    id,
    adult: false,
    backdrop_path: '',
    genres: [],
    original_language: 'en',
    original_title: title,
    overview: '',
    popularity,
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
  };
}

describe('title-search result preparation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('places normalized exact titles first and orders each group by popularity', () => {
    const movies = [
      makeMovie(1, 'High Heel Homicide', 80),
      makeMovie(2, 'heel', 10),
      makeMovie(3, 'Achilles Heel', 100),
      makeMovie(4, '  HEEL  ', 30),
      makeMovie(5, 'Heel!', 90),
    ];

    const rankedMovies = rankTitleSearchMovies(movies, ' Heel ');

    expect(rankedMovies.map(movie => movie.id)).toEqual([4, 2, 3, 5, 1]);
    expect(movies.map(movie => movie.id)).toEqual([1, 2, 3, 4, 5]);
  });

  test('removes duplicate movie ids before ranking', () => {
    const rankedMovies = rankTitleSearchMovies(
      [
        makeMovie(1, 'Heel', 10),
        makeMovie(1, 'Heel', 100),
        makeMovie(2, 'Heel Kick!', 50),
      ],
      'Heel',
    );

    expect(rankedMovies.map(movie => movie.id)).toEqual([1, 2]);
  });

  test('retrieves no more than five TMDb pages as one result set', async () => {
    mockedGet.mockImplementation(async requestPath => {
      const page = Number(
        new URLSearchParams(requestPath.split('?')[1]).get('page'),
      );
      const movie =
        page === 5
          ? makeMovie(500, 'Heel', 20)
          : makeMovie(page, `Heel variation ${page}`, 100 - page);

      return {
        data: {
          page,
          results: [movie],
          total_pages: 9,
          total_results: 180,
        },
      } as Awaited<ReturnType<typeof tmdbClient.get>>;
    });

    const results = await fetchMovieTitleSearchResults('Heel');

    expect(mockedGet).toHaveBeenCalledTimes(5);
    expect(
      mockedGet.mock.calls.map(([path]) =>
        Number(new URLSearchParams(path.split('?')[1]).get('page')),
      ),
    ).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(results.movies.map(movie => movie.id)).toEqual([1, 2, 3, 4, 500]);
    expect(
      rankTitleSearchMovies(results.movies, 'Heel').map(movie => movie.id),
    ).toEqual([500, 1, 2, 3, 4]);
    expect(results).toMatchObject({
      page: 5,
      totalPages: 9,
      totalResults: 180,
    });
  });

  test('stops after the first request when TMDb reports one result page', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        page: 1,
        results: [makeMovie(1, 'Heel', 10)],
        total_pages: 1,
        total_results: 1,
      },
    } as Awaited<ReturnType<typeof tmdbClient.get>>);

    await expect(fetchMovieTitleSearchResults('Heel')).resolves.toMatchObject({
      page: 1,
      totalPages: 1,
      totalResults: 1,
    });
    expect(mockedGet).toHaveBeenCalledTimes(1);
  });
});
