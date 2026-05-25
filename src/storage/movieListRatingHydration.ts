import { fetchMovieListImdbRating } from '../api/tmdb/services/movieService';
import type { movieType } from '../types/MovieTypes';

export async function hydrateMoviesWithCurrentImdbRatings(
  movies: movieType[]
): Promise<movieType[]> {
  const moviesWithRatings = await Promise.all(
    movies.map(async movie => {
      try {
        const rating = await fetchMovieListImdbRating(movie.id);

        return {
          movie,
          imdbRating: rating.imdb_rating,
        };
      } catch {
        return {
          movie,
          imdbRating: null,
        };
      }
    })
  );

  return moviesWithRatings
    .sort((left, right) => {
      const leftRating = left.imdbRating ?? -1;
      const rightRating = right.imdbRating ?? -1;

      if (rightRating !== leftRating) {
        return rightRating - leftRating;
      }

      return left.movie.title.localeCompare(right.movie.title);
    })
    .map(({ movie, imdbRating }) => ({
      ...movie,
      vote_average: imdbRating ?? 0,
    }));
}
