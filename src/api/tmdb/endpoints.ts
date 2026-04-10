/*
Step: 10
   * /MovieApp/src/api/tmdb/endpoints.ts
Imported by:
   * /MovieApp/src/api/tmdb/services/movieService.ts
Next step path:
   * /MovieApp/src/api/tmdb/responseTypes.ts
Purpose:
   * Centralizes the TMDB endpoint path strings so the service layer can build requests without hardcoding route fragments 
     everywhere.
*/
/*
  ENDPOINTS = map

  IN THIS PROJECT:
  - moviesService.ts uses these constants to know where to go at TMDB

  WHY THIS EXISTS:
  - Keeps endpoint strings in one place
  - Avoids random '/movie/popular' strings scattered around
  - Makes service code more readable
*/
export const ENDPOINTS = {
  MOVIE_DETAILS: '/movie',
  POPULAR_MOVIES: '/movie/popular',
  MOVIE_SEARCH: '/discover/movie',
};
