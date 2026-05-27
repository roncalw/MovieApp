import type { movieType } from '../types/MovieTypes';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

type MovieImageFields = Pick<movieType, 'poster_path' | 'backdrop_path'>;

export function getMovieImagePath(
  movie: MovieImageFields | null | undefined
): string | undefined {
  return movie?.poster_path || movie?.backdrop_path || undefined;
}

export function getMovieImageUri(
  movie: MovieImageFields | null | undefined,
  size: 'w500' = 'w500'
): string | undefined {
  const imagePath = getMovieImagePath(movie);

  return imagePath ? `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}` : undefined;
}
