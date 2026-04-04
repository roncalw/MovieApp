import type { movieType } from '../../../types/movie';

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
    budget: movie.budget,
    revenue: movie.revenue,
    runtime: movie.runtime,
  };
}