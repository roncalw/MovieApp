/**
 * IMDb rating state for Movie Detail.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx uses this hook to combine the list rating from
 *   Cloudflare with any rating refreshed from the hidden IMDb WebView scraper.
 *
 * Code flow:
 * 1. MovieDetail fetches the stored list rating with useMovieListImdbRatingQuery.
 * 2. This hook exposes that rating unless the user refreshes IMDb and a newer
 *    scrape result is found.
 * 3. If the IMDb badge is tapped, this hook creates an ImdbScrapeRequest for
 *    RenderedImdbRatingScraper and receives the result back through
 *    handleImdbScrapeResult.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ImdbScrapeRequest } from '../../types/movie/movieDetailTypes';
import type {
  CloudflareMovieListImdbRating,
  ImdbWebsiteRatingScrapeResult,
  ImdbWebsiteRatingScrapeStatus,
} from '../../types/tmdb/tmdbApiTypes';

export function useMovieImdbRating({
  imdbId,
  movieId,
  movieListImdbRating,
}: {
  imdbId?: string;
  movieId: number;
  movieListImdbRating: CloudflareMovieListImdbRating | undefined;
}) {
  const [scrapedImdbRating, setScrapedImdbRating] = useState<number | null>(
    null,
  );
  const [imdbRefreshStatus, setImdbRefreshStatus] =
    useState<ImdbWebsiteRatingScrapeStatus | null>(null);
  const [isScrapingImdbRating, setIsScrapingImdbRating] = useState(false);
  const [imdbScrapeRequest, setImdbScrapeRequest] =
    useState<ImdbScrapeRequest | null>(null);

  const imdbRating =
    scrapedImdbRating ?? movieListImdbRating?.imdb_rating ?? null;

  useEffect(() => {
    setScrapedImdbRating(null);
    setImdbRefreshStatus(null);
    setIsScrapingImdbRating(false);
    setImdbScrapeRequest(null);
  }, [movieId]);

  const handleImdbScrapeResult = useCallback(
    (scrapedRating: ImdbWebsiteRatingScrapeResult) => {
      if (scrapedRating.imdbRating !== null) {
        setScrapedImdbRating(scrapedRating.imdbRating);
        setImdbRefreshStatus('rating_found');
      } else {
        setImdbRefreshStatus(scrapedRating.status);
      }

      setIsScrapingImdbRating(false);
      setImdbScrapeRequest(null);
    },
    [],
  );

  const handleRetryImdbRating = useCallback(() => {
    if (!imdbId) {
      return;
    }

    setIsScrapingImdbRating(true);
    setImdbRefreshStatus(null);
    setImdbScrapeRequest({
      imdbId,
      requestKey: Date.now(),
    });
  }, [imdbId]);

  return {
    handleImdbScrapeResult,
    handleRetryImdbRating,
    imdbRating,
    imdbRefreshStatus,
    imdbScrapeRequest,
    isScrapingImdbRating,
  };
}
