import type { MovieImageFields } from '../types/movie/movieImageTypes';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type MovieImageSize = 'w342' | 'w500';

export function getMovieImagePath(
  movie: MovieImageFields | null | undefined
): string | undefined {
  return movie?.poster_path || movie?.backdrop_path || undefined;
}

export function getMovieImageUri(
  movie: MovieImageFields | null | undefined,
  size: MovieImageSize = 'w500'
): string | undefined {
  const imagePath = getMovieImagePath(movie);

  return imagePath ? `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}` : undefined;
}
