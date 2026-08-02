/**
 * Movie-card data hook for Search by Movie Title.
 *
 * Imported by:
 * - src/search/title/SearchByMovieTitleScreen.tsx uses this hook after TMDB
 *   title-search pages are loaded.
 *
 * Code flow:
 * 1. SearchByMovieTitleScreen gets basic TMDB movie rows from
 *    src/hooks/useMovieSearchQuery.ts.
 * 2. This hook requests the IMDb rating and subscription answer only for movie
 *    ids it has not requested yet.
 * 3. Those answers are added to the loaded rows before the shared poster-card
 *    list renders them.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMovieCardData } from '../../api/tmdb/services/movieService';
import type { movieType } from '../../types/movie/MovieTypes';
import type { MovieCardDataById } from '../../types/search/movieTitleSearchTypes';

const TITLE_SEARCH_CARD_DATA_CONCURRENCY = 6;

export function useTitleSearchCardData(titleSearchMovies: movieType[]) {
  const [movieCardDataById, setMovieCardDataById] = useState<MovieCardDataById>(
    {},
  );
  const [cardDataRunId, setCardDataRunId] = useState(0);
  const requestedMovieIdsRef = useRef<Set<number>>(new Set());
  const isMountedRef = useRef(true);
  const cardDataRunIdRef = useRef(0);

  const resetCardDataState = useCallback(() => {
    requestedMovieIdsRef.current.clear();
    cardDataRunIdRef.current += 1;
    setMovieCardDataById({});
    setCardDataRunId(cardDataRunIdRef.current);
  }, []);

  const moviesWithCardData = useMemo(() => {
    return titleSearchMovies.map(movie => {
      const cardData = movieCardDataById[movie.id];

      return {
        ...movie,
        vote_average: cardData?.imdbRating ?? 0,
        available_with_subscription:
          cardData?.availableWithSubscription ?? null,
      };
    });
  }, [movieCardDataById, titleSearchMovies]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const moviesNeedingCardData = titleSearchMovies.filter(movie => {
      return !requestedMovieIdsRef.current.has(movie.id);
    });

    if (moviesNeedingCardData.length === 0) {
      return;
    }

    moviesNeedingCardData.forEach(movie => {
      requestedMovieIdsRef.current.add(movie.id);
    });

    const activeCardDataRunId = cardDataRunIdRef.current;

    loadTitleSearchCardData(moviesNeedingCardData, cardDataUpdates => {
      if (
        !isMountedRef.current ||
        cardDataRunIdRef.current !== activeCardDataRunId
      ) {
        return;
      }

      setMovieCardDataById(currentCardData => ({
        ...currentCardData,
        ...cardDataUpdates,
      }));
    });
  }, [cardDataRunId, titleSearchMovies]);

  return {
    moviesWithCardData,
    resetCardDataState,
  };
}

async function loadTitleSearchCardData(
  movies: movieType[],
  onCardDataBatchLoaded: (cardDataUpdates: MovieCardDataById) => void,
) {
  /*
    Title searches can match many TMDB pages. Request card data only for movies
    that are already in the scrolling list, and make those requests in small
    groups. This lets the first posters appear promptly and avoids sending one
    large burst of Cloudflare requests for a broad title search.
  */
  for (
    let index = 0;
    index < movies.length;
    index += TITLE_SEARCH_CARD_DATA_CONCURRENCY
  ) {
    const movieBatch = movies.slice(
      index,
      index + TITLE_SEARCH_CARD_DATA_CONCURRENCY,
    );
    const cardDataBatch = await Promise.all(
      movieBatch.map(async movie => {
        try {
          const cardData = await fetchMovieCardData(movie.id);

          return [
            movie.id,
            {
              imdbRating: cardData.imdb_rating,
              availableWithSubscription: cardData.available_with_subscription,
            },
          ] as const;
        } catch {
          return [
            movie.id,
            {
              imdbRating: null,
              availableWithSubscription: null,
            },
          ] as const;
        }
      }),
    );

    onCardDataBatchLoaded(
      Object.fromEntries(cardDataBatch) as MovieCardDataById,
    );
  }
}
