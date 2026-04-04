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
  POPULAR_MOVIES: '/movie/popular',
};