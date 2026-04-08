/*
Step: 12
   * /MovieApp/src/api/tmdb/mappers/movieMapper.ts
Called by:
   * /MovieApp/src/api/tmdb/services/movieService.ts
Next step path:
   * /MovieApp/src/types/MovieTypes.ts
Purpose:
   * Normalizes TMDB movie payloads into the app's movieType shape and fills in safe defaults for fields that are missing 
     from list responses.
*/
import type { movieType } from '../../../types/MovieTypes';

/*
  mapMovieToMovie = repackaging station

  YES, THIS LOOKS A LITTLE SILLY RIGHT NOW.

  WHY?
  - Because your requested app-level movie type and the returned movie shape
    are effectively the same for this starter setup

  SO WHY KEEP THIS FILE?
  - Because this is the seam that matters when you change APIs later
  - Right now it is a pass-through mapper
  - Later, if TMDB shape changes or you mix in another provider,
    this is where you translate supplier format into your app format

  IN THIS PROJECT:
  - services/moviesService.ts receives raw movie items
  - it runs them through this mapper
  - the screen then gets app-level movieType[]
*/
export function mapMovieToMovie(movie: movieType): movieType {
  return {
    id: movie.id,
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    genres: movie.genres ?? [],
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: movie.title,
    video: movie.video,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genreIds: movie.genreIds ?? [],
    budget: movie.budget ?? 0,
    revenue: movie.revenue ?? 0,
    runtime: movie.runtime ?? 0,
    credits: movie.credits ?? { cast: [], crew: [] },
    release_dates: movie.release_dates ?? { results: [] },
    production_companies: movie.production_companies ?? [],
    production_countries: movie.production_countries ?? [],
  };
}
