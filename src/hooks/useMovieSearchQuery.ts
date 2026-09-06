/*
Step: 6
   * /MovieApp/src/hooks/useMovieSearchQuery.ts
Imported by:
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
   * /MovieApp/src/movie/MovieDetail.tsx
Next step path:
   * /MovieApp/src/api/tmdb/services/movieService.ts
Purpose:
   * Defines the TanStack Query hooks that screens call to request movie data without doing direct API work themselves, including 
     movie search results, one movie's detail data, person details, and the Home page movie rows.
*/
import {
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  fetchPopularMovies,
  fetchStreamingMovies,
  fetchUpcomingMovies,
  fetchMoviesByGenre,
  fetchMovieSearchResults,
  fetchMovie,
  fetchMovieExternalIds,
  fetchPerson,
  fetchPersonMovieCredits,
  fetchMovieListImdbRating,
  fetchMovieVideos,
  fetchMovieWatchProviders,
  fetchMovieLanguages,
  fetchMovieTitleSearchResults,
} from '../api/tmdb/services/movieService';
import { fetchPersonFamily } from '../api/cloudflare/personFamilyService';
import { fetchStreamingProviderCatalog } from '../api/cloudflare/streamingProviderService';
import type { HomeMovieGenreId } from '../types/tmdb/tmdbApiTypes';
import type { CursorMovieSearchPage } from '../types/search/movieQueryTypes';
import type { MovieSearchParams } from '../types/search/movieSearchParams';
import { queryKeys } from '../query/queryKeys';

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
        movieOriginalLanguages: ['ko'],
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

  - queryKey: queryKeys.movieSearch(params)
    - this is the cache identity for this query
    - the shared query-key factory returns ['movieSearch', params]
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

export function useMovieSearchQuery(params: MovieSearchParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.movieSearch(params),
    queryFn: ({ pageParam }) => fetchMovieSearchResults(params, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => {
      const nextCursor = (lastPage as CursorMovieSearchPage).nextCursor;

      return nextCursor ?? undefined;
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}

export function useMovieLanguagesQuery() {
  return useQuery({
    queryKey: queryKeys.movieLanguages,
    queryFn: fetchMovieLanguages,
    staleTime: 1000 * 60 * 60 * 24 * 7,
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

  - queryKey: queryKeys.movieCoreDetails(movieId)
    - this cache key is only for the core movie, credits, and release dates
    - the shared query-key factory keeps refresh and cache reads on this same key
    - using a new key prevents TanStack Query from reusing an older cached result
      produced by the retired all-in-one TMDB request

  - queryFn: () => fetchMovie(movieId as number)
    - this calls the single-movie detail service instead of the search-results service
    - `as number` tells TypeScript that this value should be treated as a number when the query actually runs

  - enabled: movieId !== null
    - this prevents the query from running when there is no selected movie id yet
    - that is why the hook can safely accept null until a movie card is tapped
*/
export function useMovieDetailsQuery(movieId: number | null) {
  return useQuery({
    ...getMovieDetailsQueryOptions(movieId as number),
    enabled: movieId !== null,
  });
}

export function getMovieDetailsQueryOptions(movieId: number) {
  return queryOptions({
    queryKey: queryKeys.movieCoreDetails(movieId),
    queryFn: () => fetchMovie(movieId),
    staleTime: 1000 * 60 * 5,
  });
}

/*
  These independent queries restore the legacy MovieApp request boundaries.
  React invokes all of these hooks during the same render, so TMDB can process
  the resources concurrently. A failure in one resource no longer changes the
  success state or cached value of the other resources.
*/
export function useMovieVideosQuery(movieId: number | null) {
  return useQuery({
    queryKey: queryKeys.movieVideos(movieId),
    queryFn: () => fetchMovieVideos(movieId as number),
    staleTime: 1000 * 60 * 5,
    enabled: movieId !== null,
  });
}

export function useMovieExternalIdsQuery(movieId: number | null) {
  return useQuery({
    queryKey: queryKeys.movieExternalIds(movieId),
    queryFn: () => fetchMovieExternalIds(movieId as number),
    staleTime: 1000 * 60 * 5,
    enabled: movieId !== null,
  });
}

export function useMovieWatchProvidersQuery(movieId: number | null) {
  return useQuery({
    queryKey: queryKeys.movieWatchProviders(movieId),
    queryFn: () => fetchMovieWatchProviders(movieId as number),
    staleTime: 1000 * 60 * 5,
    enabled: movieId !== null,
  });
}

export function useStreamingProviderCatalogQuery(region: string) {
  return useQuery({
    queryKey: queryKeys.streamingProviderCatalog(region),
    queryFn: ({ signal }) => fetchStreamingProviderCatalog(region, signal),
    // This request uses fetch instead of Axios, so the shared Axios retry
    // policy cannot identify a temporary transport failure. Retry it once
    // quietly; Movie Details intentionally shows no catalog-loading UI.
    retry: 1,
    retryDelay: 500,
    staleTime: 1000 * 60 * 60,
  });
}

export function useMovieListImdbRatingQuery(movieId: number | null) {
  return useQuery({
    queryKey: queryKeys.movieListImdbRating(movieId),
    queryFn: () => fetchMovieListImdbRating(movieId as number),
    staleTime: 1000 * 60 * 5,
    enabled: movieId !== null,
  });
}

export function usePersonDetailsQuery(personId: number | null) {
  return useQuery({
    ...getPersonDetailsQueryOptions(personId as number),
    enabled: personId !== null,
  });
}

export function getPersonDetailsQueryOptions(personId: number) {
  return queryOptions({
    queryKey: queryKeys.personCoreDetails(personId),
    queryFn: () => fetchPerson(personId),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePersonFamilyQuery(wikidataId: string | null) {
  const normalizedWikidataId = wikidataId?.trim().toUpperCase() ?? null;

  return useQuery({
    queryKey: queryKeys.personFamily(normalizedWikidataId),
    queryFn: () => fetchPersonFamily(normalizedWikidataId as string),
    staleTime: 1000 * 60 * 60 * 24 * 7,
    enabled: normalizedWikidataId !== null,
  });
}

export function usePersonMovieCreditsQuery(personId: number | null) {
  return useQuery({
    queryKey: queryKeys.personMovieCredits(personId),
    queryFn: () => fetchPersonMovieCredits(personId as number),
    staleTime: 1000 * 60 * 5,
    enabled: personId !== null,
  });
}

export function useMovieTitleSearchQuery(title: string, enabled = true) {
  const normalizedTitle = title.trim();

  return useInfiniteQuery({
    queryKey: queryKeys.movieTitleSearch(normalizedTitle),
    queryFn: () => fetchMovieTitleSearchResults(normalizedTitle),
    initialPageParam: 1,
    // The service has already combined up to five TMDb pages into this one
    // result packet. There is no customer-visible load-more operation.
    getNextPageParam: () => undefined,
    staleTime: 1000 * 60 * 5,
    enabled: enabled && normalizedTitle.length > 0,
  });
}

/*
======================================================== usePopularMoviesQuery ===================================================

  WHAT IS NEW IN THIS HOOK THAT WAS NOT ALREADY EXPLAINED ABOVE:
  - this hook does not need params
    - it always requests the same popular-movies endpoint
    - that is why queryKeys.popularMovies stays as just ['popularMovies']

  - queryFn: fetchPopularMovies
    - this hook can pass the service function directly
    - no wrapper function is needed because there are no arguments to pass in

  - HOW THIS LOOKS IN A SCREEN:
    - it can be used like:
      const { data, isLoading, isError, error } = usePopularMoviesQuery();
*/
export function usePopularMoviesQuery() {
  return useQuery({
    queryKey: queryKeys.popularMovies,
    queryFn: fetchPopularMovies,
    staleTime: 1000 * 60 * 5,
  });
}

/** Gives HomeScreen the subscription-only, popularity-sorted movie row. */
export function useStreamingMoviesQuery() {
  return useQuery({
    queryKey: queryKeys.streamingMovies,
    queryFn: fetchStreamingMovies,
    staleTime: 1000 * 60 * 5,
  });
}

/*
======================================================== useUpcomingMoviesQuery ===================================================

  WHAT THIS DOES:
  - Gives HomeScreen the upcoming-movies list used by the top hero carousel.
  - Keeps HomeScreen out of direct TMDB service calls, matching the existing
    Advanced Search and Popular Movies query pattern.
*/
export function useUpcomingMoviesQuery() {
  return useQuery({
    queryKey: queryKeys.upcomingMovies,
    queryFn: fetchUpcomingMovies,
    staleTime: 1000 * 60 * 5,
  });
}

/*
======================================================== useHomeGenreMoviesQuery ===================================================

  WHAT THIS DOES:
  - Requests one Home page genre row by TMDB genre id.
  - The service keeps the request aligned to the legacy app's TMDB Discover
    format, while the query key keeps each row cached separately.
*/
export function useHomeGenreMoviesQuery(
  rowKey: string,
  genreId: HomeMovieGenreId,
) {
  return useQuery({
    queryKey: queryKeys.homeGenreMovies(rowKey, genreId),
    queryFn: () => fetchMoviesByGenre(genreId),
    staleTime: 1000 * 60 * 5,
  });
}
