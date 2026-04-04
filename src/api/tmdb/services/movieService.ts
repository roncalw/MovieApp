import { tmdbClient } from '../client';
import { CONFIG } from '../config';
import { ENDPOINTS } from '../endpoints';
import type { movieType } from '../../../types/movie';
import type { PopularMoviesResponse, MovieSearchResponse } from '../responseTypes';
import { mapMovieToMovie } from '../mappers/movieMapper';

/*
  fetchPopularMovies = driver

  IN THIS PROJECT:
  - usePopularMoviesQuery.ts will call fetchPopularMovies()
  - fetchPopularMovies() uses the tmdbClient truck
  - it goes to the POPULAR_MOVIES endpoint
  - it appends your apiKey in the exact style you asked for
  - it receives a PopularMoviesResponse
  - then it returns only response.data.results mapped into movieType[]

  WHY THIS IS async:
  - because the network call is not instant
  - we must wait for TMDB to respond

  WHY THE RETURN TYPE IS Promise<movieType[]>:
  - this function does not return movies immediately
  - it returns a Promise that resolves later to movieType[]
  - useQuery expects a query function that returns a promise

  WHY WE BUILD THE URL THIS WAY:
  - because your requested example used:
      `${apiUrl}/movie/popular?${apiKey}`
  - so this function follows that same pattern using:
      `${ENDPOINTS.POPULAR_MOVIES}?${CONFIG.apiKey}`

  WHY response.data.results:
  - TMDB popular movies returns a wrapper object
  - the actual movie array lives in results
*/

/*
  WHAT THIS TYPE DOES:
  - Defines the filter values required to perform the movie search request

  WHY THIS EXISTS:
  - The service should receive one typed object instead of a long list of positional arguments
  - This makes the hook and the service call much easier to read
*/
export type MovieSearchParams = {
  movieRatings: string;
  beginDate: string;
  endDate: string;
  movieGenres: string;
  movieStreamers: string;
  movieVoteCount: string;
  movieSortBy: string;
  pageNum: number;
};

export async function fetchMovieSearchResults(
  params: MovieSearchParams
): Promise<movieType[]> {
  const {
    movieRatings,
    beginDate,
    endDate,
    movieGenres,
    movieStreamers,
    movieVoteCount,
    movieSortBy,
    pageNum,
  } = params;

  /*
    WHAT THIS PATH DOES:
    - Builds the query-string path using your existing apiKey style

    WHY THIS IS BUILT HERE:
    - The service owns the endpoint choice and path/query-string construction
    - The axios client should only apply shared config like baseURL
  */
  const path =
    `${ENDPOINTS.MOVIE_SEARCH}?${CONFIG.apiKey}` +
    `&certification=${movieRatings}` +
    `&certification_country=US` +
    `&primary_release_date.gte=${beginDate}` +
    `&primary_release_date.lte=${endDate}` +
    `&region=US` +
    `&with_genres=${movieGenres}` +
    `&with_watch_providers=${movieStreamers}` +
    `&vote_count.gte=${movieVoteCount}` +
    `&watch_region=US` +
    `&with_watch_monetization_types=flatrate` +
    `&sort_by=${movieSortBy}` +
    `&page=${pageNum}`;

  const response = await tmdbClient.get<MovieSearchResponse>(path);

  return response.data.results.map(mapMovieToMovie);
}




export async function fetchPopularMovies(): Promise<movieType[]> {
  const response = await tmdbClient.get<PopularMoviesResponse>(
    `${ENDPOINTS.POPULAR_MOVIES}?${CONFIG.apiKey}`
  );

  return response.data.results.map(mapMovieToMovie);
}

/*
  This is the version using the exact name style you originally gave:
  getPopularMovies

  I am leaving it here commented out so you can see the direct mapping
  between your snippet and the more structured project version above.

  export const getPopularMovies = async () => {
    const resp = await tmdbClient.get<PopularMoviesResponse>(
      `${ENDPOINTS.POPULAR_MOVIES}?${CONFIG.apiKey}`
    );
    return resp.data.results;
  };

  WHY I USED fetchPopularMovies ABOVE INSTEAD:
  - It fits the existing hook naming and service naming more cleanly
  - But functionally, it is the same job
*/