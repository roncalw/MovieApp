import { fetchMovieCardData } from '../../api/tmdb/services/movieService';
import type { movieType } from '../../types/movie/MovieTypes';

export async function loadMovieCardDataForMovies(
  movies: movieType[],
  sortByRating = true,
): Promise<movieType[]> {
  const moviesWithCardData = await Promise.all(
    movies.map(async movie => {
      try {
        const cardData = await fetchMovieCardData(movie.id);

        return {
          movie,
          imdbRating: cardData.imdb_rating,
          availableWithSubscription: cardData.available_with_subscription,
          availableWithoutRentOrPurchase:
            cardData.available_without_rent_or_purchase,
        };
      } catch {
        return {
          movie,
          imdbRating: null,
          availableWithSubscription: null,
          availableWithoutRentOrPurchase: null,
        };
      }
    }),
  );

  const orderedMoviesWithCardData = sortByRating
    ? [...moviesWithCardData].sort((left, right) => {
        const leftRating = left.imdbRating ?? -1;
        const rightRating = right.imdbRating ?? -1;

        if (rightRating !== leftRating) {
          return rightRating - leftRating;
        }

        return left.movie.title.localeCompare(right.movie.title);
      })
    : moviesWithCardData;

  return orderedMoviesWithCardData.map(
    ({
      movie,
      imdbRating,
      availableWithSubscription,
      availableWithoutRentOrPurchase,
    }) => ({
      ...movie,
      vote_average: imdbRating ?? 0,
      available_with_subscription: availableWithSubscription,
      available_without_rent_or_purchase: availableWithoutRentOrPurchase,
    }),
  );
}
