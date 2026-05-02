/*
Step: 7
   * /MovieApp/src/api/tmdb/services/movieService.ts
Imported by:
   * /MovieApp/src/hooks/queries/useMovieSearchQuery.ts
Next step path:
   * /MovieApp/src/api/tmdb/client.ts
Purpose:
   * Builds the TMDB request URLs for movie search, popular movies, and movie details, then fetches and shapes the data for the 
     query hooks.
*/
import { tmdbClient } from '../client';
import { CONFIG } from '../config';
import { ENDPOINTS } from '../endpoints';
import type { movieSearchResults, movieType } from '../../../types/MovieTypes';
import type { MovieSearchParams } from '../../../types/movieSearchParams';
import type {
  MovieListResponse,
  MovieDetailsResponse,
} from '../responseTypes';
import { mapMovieToMovie } from '../mappers/movieMapper';
import {
  getDefaultBeginDate,
  getDefaultEndDate,
} from '../../../utils/movieSearchDates';

const CLOUDFLARE_MOVIE_SEARCH_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies/search';

const ALL_STREAMER_PROVIDER_IDS = [
  '8',
  '15',
  '9',
  '1899',
  '192',
  '337',
  '350',
  '387',
  '526',
  '531',
];

type CloudflareMovieSearchItem = {
  tmdb_id: number;
  poster_path: string;
  imdb_rating: number | null;
};

type CloudflareMovieSearchResponse = {
  movies: CloudflareMovieSearchItem[];
  nextCursor: string | null;
  pageSize: number;
  sort: string;
  beginDate: string;
  endDate: string;
};

type CloudflareMovieSearchResults = movieSearchResults & {
  nextCursor: string | null;
};

/*
======================================================== fetchPopularMovies ====================================================

  WHAT EACH PART OF THIS FUNCTION MEANS:
  - export
    - so other files like the query hook can import and use this service

  - async
    - because the network request takes time
    - this function must wait for TMDB to respond before it can return the movies

  - function fetchPopularMovies()
    - this declares a named reusable function for the "popular movies" request
    - the hook can point directly to this function as its queryFn

  - : Promise<movieType[]>
    - this tells TypeScript the function resolves later to an array of movieType
    - it does not return the final movie array instantly

  - await tmdbClient.get<MovieListResponse>(...)
    - await pauses until the HTTP request finishes
    - tmdbClient is the shared Axios instance for TMDB
    - <MovieListResponse> tells TypeScript the raw paged list shape we expect back

  - `${ENDPOINTS.POPULAR_MOVIES}?${CONFIG.apiKey}`
    - ENDPOINTS.POPULAR_MOVIES keeps the route path centralized
    - CONFIG.apiKey passes the required TMDB key through the query string
    - together they build the exact request path the client needs

  - return response.data.results.map(mapMovieToMovie)
    - TMDB returns a JSON object, response.data is that full response, and the movie array lives in response.data.results
    - mapMovieToMovie converts each raw movie item into the app's movieType shape
    - this keeps the screen and hook working with app-level data instead of raw supplier data
*/

export async function fetchPopularMovies(): Promise<movieType[]> {
  const response = await tmdbClient.get<MovieListResponse>(
    `${ENDPOINTS.POPULAR_MOVIES}?${CONFIG.apiKey}`
  );

  return response.data.results.map(mapMovieToMovie);
}

/*
======================================================== fetchMovieSearchResults ====================================================

  - params: MovieSearchParams
    - this function receives one typed object instead of a long list of separate arguments
    - MovieSearchParams defines exactly which search values must be provided
    - this is called by passing one object, like:
      fetchMovieSearchResults({
        movieRatings: 'PG-13',
        beginDate: '2024-01-01',
        endDate: '2024-12-31',
        movieGenres: '28',
        movieStreamers: '8',
        movieVoteCount: '500',
        movieSortBy: 'vote_average.desc',
        pageNum: 1,
      })
    - this keeps the function call easier to read and harder to mix up

  - const { ... } = params
    - this is object destructuring
    - it pulls the needed values out of the params object into local variables
    - that lets the request path below use short names like movieRatings and pageNum directly
*/
export async function fetchMovieSearchResults(
  params: MovieSearchParams,
  cursor: string | null
): Promise<CloudflareMovieSearchResults> {
  return fetchCloudflareMovieSearchResults(params, cursor);
}

/*
======================================================== fetchCloudflareMovieSearchResults ====================================================

  WHAT THIS DOES:
  - Calls the Cloudflare Worker movie search endpoint instead of TMDB Discover.
  - Keeps the returned object shaped like the current app movie search result.
  - Maps Cloudflare's IMDb score into vote_average so the existing movieType can
    carry it without changing shared app types during this POC.
*/
export async function fetchCloudflareMovieSearchResults(
  params: MovieSearchParams,
  cursor: string | null
): Promise<CloudflareMovieSearchResults> {
  const {
    movieRatings,
    beginDate,
    endDate,
    movieGenres,
    movieStreamers,
    movieVoteCount,
    movieSortBy,
  } = params;

  const searchParams = new URLSearchParams();

  searchParams.set('pageSize', '20');

  if (beginDate === getDefaultBeginDate() && endDate === getDefaultEndDate()) {
    searchParams.set('datePreset', 'last5years');
  } else {
    searchParams.set('beginDate', beginDate);

    if (endDate === getDefaultEndDate()) {
      searchParams.set('endDatePreset', 'today');
    } else {
      searchParams.set('endDate', endDate);
    }
  }

  if (movieRatings) {
    searchParams.set('certifications', movieRatings);
  }

  if (movieGenres) {
    if (movieGenres.length > 0) {
      searchParams.set('genreIds', movieGenres.join(','));
    }
  }

  if (movieStreamers) {
    if (allStreamersAreSelected(movieStreamers)) {
      searchParams.set('watchMonetizationTypes', 'flatrate');
    } else if (movieStreamers.length > 0) {
      searchParams.set('providerIds', movieStreamers.join(','));
    }
  }

  if (movieVoteCount) {
    searchParams.set('minImdbVotes', movieVoteCount);
  }

  if (movieSortBy) {
    searchParams.set(
      'sort',
      movieSortBy === 'vote_average.desc' ? 'imdb' : 'popularity'
    );
  }

  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  /*
    WHAT THIS PATH DOES:
    - Builds the query-string path using your existing apiKey style

    WHY THIS IS BUILT HERE:
    - The service owns the endpoint choice and path/query-string construction
    - The axios client should only apply shared config like baseURL
    - Empty filters are skipped so the search screen can start with only the date range filled in
  */
  const response = await fetch(
    `${CLOUDFLARE_MOVIE_SEARCH_URL}?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Cloudflare movie search failed: ${response.status}`);
  }

  const data = (await response.json()) as CloudflareMovieSearchResponse;

  return {
    page: 1,
    movies: data.movies.map(mapCloudflareMovieToMovie),
    totalPages: data.nextCursor ? 2 : 1,
    nextCursor: data.nextCursor,
  };
}

function allStreamersAreSelected(streamerIds: string[]) {
  if (streamerIds.length !== ALL_STREAMER_PROVIDER_IDS.length) {
    return false;
  }

  const selectedIds = new Set(streamerIds);

  return ALL_STREAMER_PROVIDER_IDS.every((providerId) =>
    selectedIds.has(providerId)
  );
}

function mapCloudflareMovieToMovie(movie: CloudflareMovieSearchItem): movieType {
  return {
    id: movie.tmdb_id,
    adult: false,
    backdrop_path: '',
    genres: [],
    original_language: '',
    original_title: '',
    overview: '',
    popularity: 0,
    poster_path: movie.poster_path,
    release_date: '',
    title: '',
    video: false,
    vote_average: movie.imdb_rating ?? 0,
    vote_count: 0,
    genreIds: [],
    budget: 0,
    revenue: 0,
    runtime: 0,
    credits: {
      cast: [],
      crew: [],
    },
    release_dates: {
      results: [],
    },
    production_companies: [],
    production_countries: [],
  };
}

/*
============================================================= fetchMovie ======================================================

  - id: number
    - this function receives one movie id number
    - this is called by passing the selected movie id, like:
      fetchMovie(550)
    - that id gets inserted into the URL so TMDB knows which single movie to return

  - : Promise<MovieDetailsResponse>
    - this function resolves later to one full movie detail object
    - unlike the search and popular functions, this returns one movie instead of a movie array

  - `${ENDPOINTS.MOVIE_DETAILS}/${id}?${CONFIG.apiKey}&append_to_response=credits,release_dates`
    - `${id}` inserts the selected movie id into the path
    - `append_to_response=credits,release_dates` tells TMDB to include those extra detail sections in the same response
    - this lets the app get the movie details, credits, and release dates in one request

  - return response.data
    - TMDB returns one full JSON object for this endpoint
    - response.data is that full movie detail response
*/
export async function fetchMovie(id: number): Promise<MovieDetailsResponse> {
  const response = await tmdbClient.get<MovieDetailsResponse>(
    `${ENDPOINTS.MOVIE_DETAILS}/${id}?${CONFIG.apiKey}&append_to_response=credits,release_dates`
  );

  return response.data;
}
