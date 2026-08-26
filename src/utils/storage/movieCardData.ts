import { fetchMovieCardDataBatch } from '../../api/tmdb/services/movieService';
import type { movieType } from '../../types/movie/MovieTypes';
import type { CloudflareMovieCardData } from '../../types/tmdb/tmdbApiTypes';

export const MOVIE_CARD_DATA_BATCH_SIZE = 50;
export const MOVIE_CARD_DATA_BATCH_CONCURRENCY = 2;
const MOVIE_CARD_DATA_BATCH_RETRY_COUNT = 1;

function splitIntoBatches<T>(values: T[], batchSize: number) {
  const batches: T[][] = [];

  for (let index = 0; index < values.length; index += batchSize) {
    batches.push(values.slice(index, index + batchSize));
  }

  return batches;
}

async function fetchMovieCardDataBatchWithRetry(movieIds: number[]) {
  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= MOVIE_CARD_DATA_BATCH_RETRY_COUNT;
    attempt += 1
  ) {
    try {
      return await fetchMovieCardDataBatch(movieIds);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function loadMovieCardDataBatches(movieIds: number[]) {
  const movieIdBatches = splitIntoBatches(
    [...new Set(movieIds)],
    MOVIE_CARD_DATA_BATCH_SIZE,
  );
  const cardDataByMovieId = new Map<number, CloudflareMovieCardData>();
  let nextBatchIndex = 0;

  async function loadNextBatch() {
    while (nextBatchIndex < movieIdBatches.length) {
      const batchIndex = nextBatchIndex;
      nextBatchIndex += 1;
      const requestedMovieIds = movieIdBatches[batchIndex];
      const batchResults = await fetchMovieCardDataBatchWithRetry(
        requestedMovieIds,
      );
      const requestedMovieIdSet = new Set(requestedMovieIds);

      for (const cardData of batchResults) {
        if (!requestedMovieIdSet.has(cardData.tmdb_id)) {
          throw new Error(
            `Movie card batch returned unexpected TMDB ID ${cardData.tmdb_id}.`,
          );
        }

        cardDataByMovieId.set(cardData.tmdb_id, cardData);
      }

      const missingMovieId = requestedMovieIds.find(
        movieId => !cardDataByMovieId.has(movieId),
      );

      if (missingMovieId !== undefined) {
        throw new Error(
          `Movie card batch did not return TMDB ID ${missingMovieId}.`,
        );
      }
    }
  }

  const workerCount = Math.min(
    MOVIE_CARD_DATA_BATCH_CONCURRENCY,
    movieIdBatches.length,
  );

  await Promise.all(Array.from({ length: workerCount }, () => loadNextBatch()));

  return cardDataByMovieId;
}

export function compareMoviesByImdbRating(left: movieType, right: movieType) {
  const leftRating = left.imdb_rating ?? -1;
  const rightRating = right.imdb_rating ?? -1;

  if (rightRating !== leftRating) {
    return rightRating - leftRating;
  }

  return left.title.localeCompare(right.title);
}

export function sortMoviesByImdbRating(movies: movieType[]) {
  return [...movies].sort(compareMoviesByImdbRating);
}

export async function loadMovieCardDataForMovies(
  movies: movieType[],
  sortByRating = true,
): Promise<movieType[]> {
  if (movies.length === 0) {
    return [];
  }

  const cardDataByMovieId = await loadMovieCardDataBatches(
    movies.map(movie => movie.id),
  );
  const moviesWithCardData = movies.map(movie => {
    const cardData = cardDataByMovieId.get(movie.id);

    if (!cardData) {
      throw new Error(`Movie card data is missing for TMDB ID ${movie.id}.`);
    }

    return {
      ...movie,
      imdb_rating: cardData.imdb_rating,
      vote_average: cardData.imdb_rating ?? 0,
      available_with_subscription: cardData.available_with_subscription,
      available_without_rent_or_purchase:
        cardData.available_without_rent_or_purchase,
    };
  });

  return sortByRating
    ? sortMoviesByImdbRating(moviesWithCardData)
    : moviesWithCardData;
}
