/*
Step: 6
   * /MovieApp/src/hooks/queries/useMovieSearchQuery.ts
Called by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
   * /MovieApp/src/screens/MovieDetail.tsx
Next step path:
   * /MovieApp/src/api/tmdb/services/movieService.ts
Purpose:
   * Defines the TanStack Query hooks that screens call to request movie data without doing direct API work themselves, including 
     movie search results, one movie's detail data, and the older popular-movies list flow.
*/
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchPopularMovies,
  fetchMovieSearchResults,
  fetchMovie,
} from '../../api/tmdb/services/movieService';
import type { MovieSearchParams } from '../../types/movieSearchParams';

/*
======================================================== useMovieSearchQuery ===================================================

  WHAT A HOOK IS:
  - a hook is a React function that starts with the word `use`
  - hooks let React function components use shared behavior like state, effects, context, or data fetching
  - hooks must be called at the top level of a React component or inside another hook

  WHAT A CUSTOM HOOK IS:
  - `useMovieSearchQuery` is a custom hook
  - that means it is your own reusable hook built on top of other hooks
  - in this case, it is built on top of TanStack Query's `useInfiniteQuery`

  WHY THIS HOOK EXISTS:
  - the screen should not build cache logic and API-calling logic inline
  - this hook keeps the screen cleaner
  - this hook gives the app one reusable place for the movie-search query behavior

  - params: MovieSearchParams
    - this hook receives one typed object with the current search filters
    - this is called by passing one object, like:
      useMovieSearchQuery({
        movieRatings: 'PG-13',
        beginDate: '2024-01-01',
        endDate: '2024-12-31',
        movieGenres: '28',
        movieStreamers: '8',
        movieVoteCount: '500',
        movieSortBy: 'vote_average.desc',
      })

  - return useInfiniteQuery({ ... })
    - this hook returns the result of TanStack Query's `useInfiniteQuery`
    - that returned object includes values like:
      data
      isLoading
      isError
      error
      fetchNextPage

  - queryKey: ['movieSearch', params]
    - this is the cache identity for this query
    - TanStack Query uses it to know whether this exact search was already fetched before
    - if the params change, the query key changes too, so TanStack knows this is a different search

  - queryFn: ({ pageParam }) => fetchMovieSearchResults(params, pageParam)
    - this is the function TanStack Query runs when it needs fresh data
    - `fetchMovieSearchResults` does the actual service-layer API work for one page at a time
    - this hook decides when to run it and what the next page should be, while the service decides what request to make

  - staleTime: 1000 * 60 * 5
    - this marks the data as fresh for 5 minutes
    - that helps avoid unnecessary refetching when the same search is revisited soon after

  HOW THIS LOOKS IN A SCREEN:
  - in MovieSearchScreen, it is used like this:
      const { data, isLoading, isError, error } = useMovieSearchQuery(queryParams);
  - `queryParams` is the object built from the screen's selected filters
  - when the screen state changes, `queryParams` changes
  - when `queryParams` changes, the query key changes
  - then TanStack Query knows it may need to run a new paged search request
*/

export function useMovieSearchQuery(params: MovieSearchParams) {
  return useInfiniteQuery({
    queryKey: ['movieSearch', params],
    queryFn: ({ pageParam }) => fetchMovieSearchResults(params, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.totalPages) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/*
======================================================== useMovieDetailsQuery ===================================================

  WHAT IS NEW IN THIS HOOK THAT WAS NOT ALREADY EXPLAINED ABOVE:
  - movieId: number | null
    - this hook receives either a movie id number or null
    - null means "do not fetch movie details yet"
    - this is called like:
      useMovieDetailsQuery(550)
      or
      useMovieDetailsQuery(null)

  - queryKey: ['movieDetails', movieId]
    - this cache key is for one specific movie details request
    - the movie id is included so each movie gets its own cache entry

  - queryFn: () => fetchMovie(movieId as number)
    - this calls the single-movie detail service instead of the search-results service
    - `as number` tells TypeScript that this value should be treated as a number when the query actually runs

  - enabled: movieId !== null
    - this prevents the query from running when there is no selected movie id yet
    - that is why the hook can safely accept null until a movie card is tapped
*/
export function useMovieDetailsQuery(movieId: number | null) {
  return useQuery({
    queryKey: ['movieDetails', movieId],
    queryFn: () => fetchMovie(movieId as number),
    staleTime: 1000 * 60 * 5,
    enabled: movieId !== null,
  });
}

/*
======================================================== usePopularMoviesQuery ===================================================

  WHAT IS NEW IN THIS HOOK THAT WAS NOT ALREADY EXPLAINED ABOVE:
  - this hook does not need params
    - it always requests the same popular-movies endpoint
    - that is why the query key can stay as just ['popularMovies']

  - queryFn: fetchPopularMovies
    - this hook can pass the service function directly
    - no wrapper function is needed because there are no arguments to pass in

  - HOW THIS LOOKS IN A SCREEN:
    - it can be used like:
      const { data, isLoading, isError, error } = usePopularMoviesQuery();
*/
export function usePopularMoviesQuery() {
  return useQuery({
    queryKey: ['popularMovies'],
    queryFn: fetchPopularMovies,
    staleTime: 1000 * 60 * 5,
  });
}
