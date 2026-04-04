import type { movieType } from '../../types/movie';

/*
  PopularMoviesResponse = supplier package shape for the popular movies endpoint

  IN THIS PROJECT:
  - TMDB returns an object whose results property is an array of movies
  - getPopularMovies / fetchPopularMovies will receive that raw shape first

  WHY THIS FILE EXISTS:
  - Separates endpoint response shape from the app screen
  - Keeps the service layer explicit about what the supplier returns

  WHY movieType[] IS USED HERE:
  - You requested to use movieType
  - So results is typed using your movieType shape
*/
export type PopularMoviesResponse = {
  page: number;
  results: movieType[];
  total_pages: number;
  total_results: number;
};