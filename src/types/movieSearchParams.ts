/*
Step: 14
   * /MovieApp/src/types/movieSearchParams.ts
Called by:
   * /MovieApp/src/hooks/queries/useMovieSearchQuery.ts
   * /MovieApp/src/api/tmdb/services/movieService.ts
Next step path:
   * /MovieApp/src/api/tmdb/services/movieService.ts
Purpose:
   * Defines the typed bundle of search filter values that flows from the screen into the query hook and then into the movie 
     service request builder.
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
  movieGenres: string[];
  movieStreamers: string[];
  movieVoteCount: string;
  movieSortBy: string;
};
