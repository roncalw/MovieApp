/*
Step: 11
   * /MovieApp/src/api/tmdb/responseTypes.ts
Imported by:
   * /MovieApp/src/api/tmdb/services/movieService.ts
Next step path:
   * /MovieApp/src/api/tmdb/mappers/movieMapper.ts
Purpose:
   * Describes the raw TMDB response shapes that the service layer expects before mapping or returning the data to the 
     app.
*/
import type { movieType } from '../../types/MovieTypes';

/*
  MovieListResponse = supplier package shape for TMDB endpoints
  that return a paged list of movies

  IN THIS PROJECT:
  - TMDB returns an object whose results property is an array of movies
  - fetchPopularMovies and fetchMovieSearchResults both receive this raw shape first

  WHY THIS FILE EXISTS:
  - Separates endpoint response shape from the app screen
  - Keeps the service layer explicit about what the supplier returns

  WHY movieType[] IS USED HERE:
  - You requested to use movieType
  - So results is typed using your movieType shape
*/
export type MovieListResponse = {
  page: number;
  results: movieType[];
  total_pages: number;
  total_results: number;
};

/*
  MovieDetailsResponse = supplier package shape for one single movie details response

  IN THIS PROJECT:
  - the TMDB movie-details endpoint returns one movie object
  - it does not return a paged wrapper with a results property
  - that is why this type should NOT be:
      results: movieType
  - `results` belongs to the list endpoints, not the single-movie details endpoint
  - since movieType already contains the detail fields this app cares about,
    MovieDetailsResponse can just be movieType directly
*/
export type MovieDetailsResponse = movieType;
