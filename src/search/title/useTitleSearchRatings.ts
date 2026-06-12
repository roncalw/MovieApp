/**
 * Rating hydration hook for Search by Movie Title.
 *
 * Imported by:
 * - src/search/title/SearchByMovieTitleScreen.tsx uses this hook after TMDB
 *   title-search pages are loaded.
 *
 * Code flow:
 * 1. SearchByMovieTitleScreen gets basic TMDB movie rows from
 *    src/hooks/useMovieSearchQuery.ts.
 * 2. This hook receives those loaded rows and requests IMDb ratings only for
 *    movie ids it has not requested yet.
 * 3. Ratings are merged back into the movie rows and returned to the screen for
 *    rendering by src/search/results/MovieResults.tsx.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMovieListImdbRating } from '../../api/tmdb/services/movieService';
import type { movieType } from '../../types/movie/MovieTypes';
import type { MovieRatingById } from '../../types/search/movieTitleSearchTypes';

const TITLE_SEARCH_RATING_CONCURRENCY = 6;

export function useTitleSearchRatings(titleSearchMovies: movieType[]) {
  const [movieRatingsById, setMovieRatingsById] = useState<MovieRatingById>({});
  const [ratingHydrationRunId, setRatingHydrationRunId] = useState(0);
  const requestedRatingIdsRef = useRef<Set<number>>(new Set());
  const isMountedRef = useRef(true);
  const ratingHydrationRunIdRef = useRef(0);

  const resetRatingHydrationState = useCallback(() => {
    requestedRatingIdsRef.current.clear();
    ratingHydrationRunIdRef.current += 1;
    setMovieRatingsById({});
    setRatingHydrationRunId(ratingHydrationRunIdRef.current);
  }, []);

  const moviesWithRatings = useMemo(() => {
    return titleSearchMovies.map((movie) => ({
      ...movie,
      vote_average: movieRatingsById[movie.id] ?? 0,
    }));
  }, [movieRatingsById, titleSearchMovies]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const moviesNeedingRatings = titleSearchMovies.filter((movie) => {
      return !requestedRatingIdsRef.current.has(movie.id);
    });

    if (moviesNeedingRatings.length === 0) {
      return;
    }

    moviesNeedingRatings.forEach((movie) => {
      requestedRatingIdsRef.current.add(movie.id);
    });

    const activeRatingHydrationRunId = ratingHydrationRunIdRef.current;

    hydrateLoadedTitleSearchRatings(moviesNeedingRatings, (ratingUpdates) => {
      if (
        !isMountedRef.current ||
        ratingHydrationRunIdRef.current !== activeRatingHydrationRunId
      ) {
        return;
      }

      setMovieRatingsById((currentRatings) => ({
        ...currentRatings,
        ...ratingUpdates,
      }));
    });
  }, [ratingHydrationRunId, titleSearchMovies]);

  return {
    moviesWithRatings,
    resetRatingHydrationState,
  };
}

async function hydrateLoadedTitleSearchRatings(
  movies: movieType[],
  onRatingBatchLoaded: (ratingUpdates: MovieRatingById) => void
) {
  /*
    Title searches can match many TMDB pages. This hydrates only the movies that
    the app has already loaded into the scrolling list, and it does the requests
    in small batches so a broad title search does not block the first cards from
    rendering or create one large burst of Cloudflare rating calls.
  */
  for (
    let index = 0;
    index < movies.length;
    index += TITLE_SEARCH_RATING_CONCURRENCY
  ) {
    const movieBatch = movies.slice(
      index,
      index + TITLE_SEARCH_RATING_CONCURRENCY
    );
    const ratingBatch = await Promise.all(
      movieBatch.map(async (movie) => {
        try {
          const rating = await fetchMovieListImdbRating(movie.id);

          return [movie.id, rating.imdb_rating] as const;
        } catch {
          return [movie.id, null] as const;
        }
      })
    );

    onRatingBatchLoaded(Object.fromEntries(ratingBatch) as MovieRatingById);
  }
}
