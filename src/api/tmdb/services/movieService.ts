/*
Step: 7
   * /MovieApp/src/api/tmdb/services/movieService.ts
Imported by:
   * /MovieApp/src/hooks/useMovieSearchQuery.ts
Next step path:
   * /MovieApp/src/api/tmdb/client.ts
Purpose:
   * Builds the TMDB request URLs for movie search, Home rows, popular movies, and movie details, then fetches and shapes the
     data for the query hooks.
*/
import { tmdbClient } from '../client';
import { CONFIG } from '../config';
import { ENDPOINTS } from '../endpoints';
import type {
  movieExternalIDs,
  movieType,
  movieVideos,
  movieWatchProvidersType,
  personDetailType,
  personMovieCredits,
  personMovieCastCredit,
  personMovieCrewCredit,
} from '../../../types/movie/MovieTypes';
import type { MovieSearchParams } from '../../../types/search/movieSearchParams';
import type {
  CloudflareMovieCardData,
  CloudflareMovieListImdbRating,
  CloudflareMovieSearchItem,
  CloudflareMovieSearchResponse,
  CloudflareMovieSearchResults,
  HomeMovieGenreId,
  MovieDetailsResponse,
  MovieListResponse,
  MovieLanguagesResponse,
  MovieTitleSearchResults,
} from '../../../types/tmdb/tmdbApiTypes';
import { mapMovieToMovie } from '../mappers/movieMapper';
import {
  getDefaultBeginDate,
  getDefaultEndDate,
} from '../../../utils/movieSearchDates';
import { normalizeMovieOriginalLanguages } from '../../../utils/movieOriginalLanguages';

const CLOUDFLARE_MOVIE_SEARCH_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies/search';
const CLOUDFLARE_MOVIE_LIST_BASE_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies';
const CLOUDFLARE_MOVIE_LANGUAGES_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies/languages';

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

type MovieRequestOptions = {
  bypassCache?: boolean;
};

const MAX_TITLE_SEARCH_PAGES = 5;

const NO_CACHE_REQUEST_HEADERS = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
};

function buildLegacyTmdbPath(endpoint: string, queryString = '') {
  const suffix = queryString.length > 0 ? `&${queryString}` : '';

  return `${endpoint}?${CONFIG.apiKey}${suffix}`;
}

async function fetchHomeMovieList(
  label: string,
  path: string,
  options?: MovieRequestOptions,
): Promise<MovieListResponse> {
  /*
    WHY HOME USES tmdbClient:
    - The Advanced Search page intentionally uses the Cloudflare Worker.
    - The Home page intentionally talks directly to TMDB, matching the legacy app.
    - tmdbClient centralizes the direct TMDB request headers, including Android's
      browser-like User-Agent. Do not bypass this helper with raw fetch calls for
      Home-page TMDB rows.
  */
  let stage = 'start';

  try {
    stage = 'axios-get';
    const requestPath = options?.bypassCache
      ? `${path}&refreshRequest=${Date.now()}`
      : path;
    const response = await tmdbClient.get<MovieListResponse>(
      requestPath,
      options?.bypassCache ? { headers: NO_CACHE_REQUEST_HEADERS } : undefined,
    );

    return response.data;
  } catch (error) {
    logHomeTmdbError(label, path, error, stage);
    throw error;
  }
}

function logHomeTmdbError(
  label: string,
  path: string,
  error: unknown,
  stage: string,
) {
  /*
    DEVELOPMENT DIAGNOSTIC:
    - The Home page talks directly to TMDB.
    - Android can report several different network failures as the same generic
      "Network Error" in the UI.
    - This logs the supplier URL and Axios details only in development builds so
      we can tell whether the real issue is HTTP status, timeout, TLS, DNS, or
      an Android networking failure.
  */
  if (!__DEV__) {
    return;
  }

  console.error('[Home TMDB request failed]', {
    label,
    stage,
    path,
    error,
  });
}

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
  const path = buildLegacyTmdbPath(ENDPOINTS.POPULAR_MOVIES);
  const data = await fetchHomeMovieList('popular', path);

  return data.results.map(mapMovieToMovie);
}

/*
======================================================== fetchUpcomingMovies ====================================================

  WHAT THIS DOES:
  - Requests TMDB's upcoming movie list for the Home page hero carousel.
  - Returns the same app-level movieType[] shape as fetchPopularMovies so Home can
    open the existing MovieDetail overlay from either the hero image or poster row.
*/
export async function fetchUpcomingMovies(): Promise<movieType[]> {
  const path = buildLegacyTmdbPath(ENDPOINTS.UPCOMING_MOVIES);
  const data = await fetchHomeMovieList('upcoming', path);

  return data.results.map(mapMovieToMovie);
}

/*
======================================================== fetchMoviesByGenre ====================================================

  WHAT THIS DOES:
  - Matches the legacy Home page genre rows.
  - Calls TMDB Discover with only with_genres, which keeps TMDB's default
    Discover ordering exactly like the legacy app did.
*/
export async function fetchMoviesByGenre(
  genreId: HomeMovieGenreId,
): Promise<movieType[]> {
  const path = buildLegacyTmdbPath(
    ENDPOINTS.MOVIE_SEARCH,
    `with_genres=${genreId}`,
  );
  const data = await fetchHomeMovieList(`genre-${genreId}`, path);

  return data.results.map(mapMovieToMovie);
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
        movieOriginalLanguages: ['ko'],
        movieVoteCount: '500',
        movieSortBy: 'vote_average.desc',
      })
    - this keeps the function call easier to read and harder to mix up

  - const { ... } = params
    - this is object destructuring
    - it pulls the needed values out of the params object into local variables
    - that lets the request path below use short names like movieRatings and pageNum directly
*/
export async function fetchMovieSearchResults(
  params: MovieSearchParams,
  cursor: string | null,
  options?: MovieRequestOptions,
): Promise<CloudflareMovieSearchResults> {
  return fetchCloudflareMovieSearchResults(params, cursor, options);
}

export async function fetchMovieListImdbRating(
  movieId: number,
): Promise<CloudflareMovieListImdbRating> {
  const response = await fetch(
    `${CLOUDFLARE_MOVIE_LIST_BASE_URL}/${movieId}/imdb-rating`,
  );

  if (!response.ok) {
    throw new Error(`Cloudflare IMDb rating lookup failed: ${response.status}`);
  }

  return (await response.json()) as CloudflareMovieListImdbRating;
}

export async function fetchMovieCardData(
  movieId: number,
): Promise<CloudflareMovieCardData> {
  const response = await fetch(
    `${CLOUDFLARE_MOVIE_LIST_BASE_URL}/${movieId}/card-data`,
  );

  if (!response.ok) {
    throw new Error(`Cloudflare movie card lookup failed: ${response.status}`);
  }

  return (await response.json()) as CloudflareMovieCardData;
}

export async function fetchMovieLanguages(): Promise<MovieLanguagesResponse> {
  const response = await fetch(CLOUDFLARE_MOVIE_LANGUAGES_URL);

  if (!response.ok) {
    throw new Error(`Cloudflare movie languages failed: ${response.status}`);
  }

  return (await response.json()) as MovieLanguagesResponse;
}

export async function fetchMoviesByTitle(
  title: string,
  page: number,
  options?: MovieRequestOptions,
): Promise<MovieTitleSearchResults> {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return {
      movies: [],
      page: 1,
      totalPages: 0,
      totalResults: 0,
    };
  }

  const queryString = new URLSearchParams({
    query: normalizedTitle,
    page: page.toString(),
    include_adult: 'false',
  });
  const path = buildLegacyTmdbPath(
    ENDPOINTS.SEARCH_MOVIES_BY_TITLE,
    queryString.toString(),
  );
  const data = await fetchHomeMovieList('title-search', path, options);

  return {
    movies: data.results.map(mapMovieToMovie),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

/**
 * Loads the bounded result set used by Search by Movie Title.
 *
 * TMDb exposes title-search results as pages, but MovieApp presents one stable
 * grid. The first response tells us how many pages exist. We then request the
 * remaining pages concurrently, stopping after page five even when TMDb has
 * more. At the normal TMDb page size, this examines at most 100 movies without
 * making the customer scroll through supplier-defined page boundaries. The
 * screen applies customer-facing exact-match ordering without changing this
 * cached supplier response.
 */
export async function fetchMovieTitleSearchResults(
  title: string,
  options?: MovieRequestOptions,
): Promise<MovieTitleSearchResults> {
  const firstPage = await fetchMoviesByTitle(title, 1, options);
  const lastPageToFetch = Math.min(
    MAX_TITLE_SEARCH_PAGES,
    firstPage.totalPages,
  );
  const remainingPageNumbers = Array.from(
    { length: Math.max(0, lastPageToFetch - 1) },
    (_, index) => index + 2,
  );
  const remainingPages = await Promise.all(
    remainingPageNumbers.map(page => fetchMoviesByTitle(title, page, options)),
  );
  const loadedMovies = [firstPage, ...remainingPages].flatMap(
    page => page.movies,
  );

  return {
    movies: loadedMovies,
    page: lastPageToFetch || firstPage.page,
    totalPages: firstPage.totalPages,
    totalResults: firstPage.totalResults,
  };
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
  cursor: string | null,
  options?: MovieRequestOptions,
): Promise<CloudflareMovieSearchResults> {
  const {
    movieRatings,
    beginDate,
    endDate,
    movieGenres,
    movieStreamers,
    movieOriginalLanguages,
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

  const normalizedOriginalLanguages = normalizeMovieOriginalLanguages(
    movieOriginalLanguages,
  );

  if (normalizedOriginalLanguages.length > 0) {
    searchParams.set(
      'originalLanguages',
      normalizedOriginalLanguages.join(','),
    );
  }

  if (movieVoteCount && movieVoteCount !== '0') {
    searchParams.set('minImdbVotes', movieVoteCount);
  }

  if (movieSortBy) {
    searchParams.set(
      'sort',
      movieSortBy === 'vote_average.desc' ? 'imdb' : 'popularity',
    );
  }

  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  if (options?.bypassCache) {
    searchParams.set('refreshRequest', Date.now().toString());
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
    `${CLOUDFLARE_MOVIE_SEARCH_URL}?${searchParams.toString()}`,
    options?.bypassCache ? { headers: NO_CACHE_REQUEST_HEADERS } : undefined,
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

  return ALL_STREAMER_PROVIDER_IDS.every(providerId =>
    selectedIds.has(providerId),
  );
}

function mapCloudflareMovieToMovie(
  movie: CloudflareMovieSearchItem,
): movieType {
  return {
    id: movie.tmdb_id,
    adult: false,
    backdrop_path: '',
    genres: [],
    original_language: movie.original_language ?? '',
    original_title: '',
    overview: '',
    popularity: 0,
    poster_path: movie.poster_path,
    release_date: '',
    title: '',
    video: false,
    vote_average: movie.imdb_rating ?? 0,
    vote_count: 0,
    available_with_subscription: movie.available_with_subscription,
    available_without_rent_or_purchase:
      movie.available_without_rent_or_purchase,
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
    videos: {
      results: [],
    },
    external_ids: undefined,
    production_companies: [],
    production_countries: [],
  };
}

/*
======================================================== Movie Detail Resources ================================================

  WHY MOVIE DETAIL USES FOUR REQUESTS:
  - The legacy MovieApp loaded these resources independently and concurrently.
  - TMDB can return an HTTP 200 response whose large append_to_response bundle is
    missing one or more nested resources. Splitting the requests prevents one
    incomplete bundle from silently removing cast, streaming, trailers, and IDs.
  - Separate TanStack Query keys let the app retry and cache each resource without
    discarding the movie information that already loaded successfully.

  REQUEST OWNERSHIP:
  - fetchMovie owns the core movie, US alternative titles, cast, crew, and
    release certifications.
  - fetchMovieVideos owns trailer metadata.
  - fetchMovieExternalIds owns the IMDb identifier used by the Reviews link.
  - fetchMovieWatchProviders owns US subscription, ad-supported, and rental data.

  Every request below goes directly to api.themoviedb.org through tmdbClient.
  None of these functions uses the MovieApp Cloudflare Worker.
*/
export async function fetchMovie(id: number): Promise<MovieDetailsResponse> {
  return fetchTmdbDetailResource<MovieDetailsResponse>(
    'movie-core',
    `${ENDPOINTS.MOVIE_DETAILS}/${id}?${CONFIG.apiKey}&append_to_response=credits,release_dates,alternative_titles`,
  );
}

export async function fetchMovieVideos(id: number): Promise<movieVideos> {
  return fetchTmdbDetailResource<movieVideos>(
    'movie-videos',
    `${ENDPOINTS.MOVIE_DETAILS}/${id}/videos?${CONFIG.apiKey}`,
  );
}

export async function fetchMovieExternalIds(
  id: number,
): Promise<movieExternalIDs> {
  return fetchTmdbDetailResource<movieExternalIDs>(
    'movie-external-ids',
    `${ENDPOINTS.MOVIE_DETAILS}/${id}/external_ids?${CONFIG.apiKey}`,
  );
}

export async function fetchMovieWatchProviders(
  id: number,
): Promise<movieWatchProvidersType> {
  return fetchTmdbDetailResource<movieWatchProvidersType>(
    'movie-watch-providers',
    `${ENDPOINTS.MOVIE_DETAILS}/${id}/watch/providers?${CONFIG.apiKey}`,
  );
}

/*
  Actor profiles follow the same isolation rule as movie details.

  The profile page displays fields from /person/{id} and filmography from
  /person/{id}/movie_credits. external_ids is appended to the core request so
  the profile can use TMDB's Wikidata ID without making a second TMDB request.
*/
export async function fetchPerson(personId: number): Promise<personDetailType> {
  return fetchTmdbDetailResource<personDetailType>(
    'person-core',
    `${ENDPOINTS.PERSON_DETAILS}/${personId}?${CONFIG.apiKey}&append_to_response=external_ids`,
  );
}

export async function fetchPersonMovieCredits(
  personId: number,
): Promise<personMovieCredits> {
  return fetchTmdbDetailResource<personMovieCredits>(
    'person-movie-credits',
    `${ENDPOINTS.PERSON_DETAILS}/${personId}/movie_credits?${CONFIG.apiKey}`,
  );
}

async function fetchTmdbDetailResource<T>(
  label: string,
  path: string,
): Promise<T> {
  try {
    const response = await tmdbClient.get<T>(path);

    return response.data;
  } catch (error) {
    if (__DEV__) {
      // Keep technical diagnostics in development logs instead of displaying
      // Axios messages such as "Request failed with status code 502" to users.
      console.error('[TMDB detail request failed]', { label, error });
    }

    throw error;
  }
}

export function mapPersonMovieCreditToMovie(
  credit: personMovieCastCredit | personMovieCrewCredit,
): movieType {
  return {
    id: credit.id,
    adult: credit.adult,
    backdrop_path: credit.backdrop_path ?? '',
    genres: [],
    original_language: credit.original_language,
    original_title: credit.original_title,
    overview: credit.overview,
    popularity: credit.popularity,
    poster_path: credit.poster_path ?? '',
    release_date: credit.release_date,
    title: credit.title,
    video: credit.video,
    vote_average: credit.vote_average,
    vote_count: credit.vote_count,
    genreIds: credit.genre_ids ?? [],
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
    videos: {
      results: [],
    },
    external_ids: undefined,
    production_companies: [],
    production_countries: [],
  };
}
