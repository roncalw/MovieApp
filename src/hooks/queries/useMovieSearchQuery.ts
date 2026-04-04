import { useQuery } from '@tanstack/react-query';
import { fetchPopularMovies, fetchMovieSearchResults, type MovieSearchParams, } from '../../api/tmdb/services/movieService';

/*
  usePopularMoviesQuery = warehouse request desk

  IN THIS PROJECT:
  - PopularMoviesScreen calls usePopularMoviesQuery()
  - usePopularMoviesQuery() calls useQuery(...)
  - useQuery(...) uses fetchPopularMovies as the driver

  WHY THIS FILE EXISTS:
  - keeps TanStack Query logic out of the screen
  - gives this project one reusable place for the popular movies query
  - later you will likely add:
      useMovieDetailsQuery
      useMovieSearchQuery
      useGenresQuery

  queryKey: ['popularMovies']
  IN THIS PROJECT:
  - this is the cache label for the popular movies request
  - TanStack uses it to know whether the data is already cached

  queryFn: fetchPopularMovies
  WHAT THIS MEANS HERE:
  - TanStack decides WHEN to fetch
  - fetchPopularMovies decides WHAT supplier call to make
  - fetchPopularMovies uses tmdbClient to perform the trip

  staleTime: 1000 * 60 * 5
  IN THIS PROJECT:
  - popular movies are treated as fresh for 5 minutes
  - if you leave and come back quickly, the app can reuse cached results
*/

/*
  WHAT THIS DOES:
  - Creates the TanStack Query hook for the movie search page

  WHY THIS CHANGES:
  - The old hook was for a fixed popular-movies request
  - The new screen depends on selector-driven filter values
  - So the query key needs to include those params
*/

export function useMovieSearchQuery(params: MovieSearchParams) {
  return useQuery({
    queryKey: ['movieSearch', params],
    queryFn: () => fetchMovieSearchResults(params),
    staleTime: 1000 * 60 * 5,
  });
}


export function usePopularMoviesQuery() {
  return useQuery({
    queryKey: ['popularMovies'],
    queryFn: fetchPopularMovies,
    staleTime: 1000 * 60 * 5,
  });
}