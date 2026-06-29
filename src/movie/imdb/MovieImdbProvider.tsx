/**
 * IMDb feature boundary for Movie Detail.
 *
 * The provider owns the two secondary resources used only by IMDb UI: the
 * stored list rating and TMDB's external IMDb identifier. Keeping these query
 * observers below MovieDetail prevents either response from redrawing the
 * movie's credits, streaming information, or other unrelated sections.
 */
import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import {
  useMovieExternalIdsQuery,
  useMovieListImdbRatingQuery,
} from '../../hooks/useMovieSearchQuery';
import type { movieType } from '../../types/movie/MovieTypes';
import type { ImdbWebsiteRatingScrapeStatus } from '../../types/tmdb/tmdbApiTypes';
import { MovieHero } from '../components/MovieHero';
import { RenderedImdbRatingScraper } from './RenderedImdbRatingScraper';
import { useMovieImdbRating } from './useMovieImdbRating';

type MovieImdbContextValue = {
  externalIdsError: unknown;
  externalIdsFailed: boolean;
  externalIdsRetrying: boolean;
  imdbId?: string;
  imdbRating: number | null;
  imdbRefreshStatus: ImdbWebsiteRatingScrapeStatus | null;
  isScrapingImdbRating: boolean;
  onRetryExternalIds: () => void;
  onRetryImdbRating: () => void;
};

const MovieImdbContext = createContext<MovieImdbContextValue | null>(null);

export function MovieImdbProvider({
  children,
  movieId,
}: PropsWithChildren<{ movieId: number }>) {
  const externalIdsQuery = useMovieExternalIdsQuery(movieId);
  const { data: movieListImdbRating } = useMovieListImdbRatingQuery(movieId);
  const imdbId = externalIdsQuery.data?.imdb_id;
  const {
    handleImdbScrapeResult,
    handleRetryImdbRating,
    imdbRating,
    imdbRefreshStatus,
    imdbScrapeRequest,
    isScrapingImdbRating,
  } = useMovieImdbRating({ imdbId, movieId, movieListImdbRating });
  const contextValue = useMemo<MovieImdbContextValue>(
    () => ({
      externalIdsError: externalIdsQuery.error,
      externalIdsFailed: externalIdsQuery.isError,
      externalIdsRetrying: externalIdsQuery.isFetching,
      imdbId,
      imdbRating,
      imdbRefreshStatus,
      isScrapingImdbRating,
      onRetryExternalIds: externalIdsQuery.refetch,
      onRetryImdbRating: handleRetryImdbRating,
    }),
    [
      externalIdsQuery.error,
      externalIdsQuery.isError,
      externalIdsQuery.isFetching,
      externalIdsQuery.refetch,
      handleRetryImdbRating,
      imdbId,
      imdbRating,
      imdbRefreshStatus,
      isScrapingImdbRating,
    ],
  );

  return (
    <MovieImdbContext.Provider value={contextValue}>
      {children}
      <RenderedImdbRatingScraper
        scrapeRequest={imdbScrapeRequest}
        onResult={handleImdbScrapeResult}
      />
    </MovieImdbContext.Provider>
  );
}

export function MovieImdbHero({
  movie,
  onBackPress,
}: {
  movie: movieType | null;
  onBackPress?: () => void;
}) {
  const {
    imdbRating,
    imdbRefreshStatus,
    isScrapingImdbRating,
    onRetryImdbRating,
  } = useMovieImdbFeature();

  return (
    <MovieHero
      movie={movie}
      imdbRating={imdbRating}
      imdbRefreshStatus={imdbRefreshStatus}
      isImdbRatingLoading={isScrapingImdbRating}
      onBackPress={onBackPress}
      onRetryImdbRating={onRetryImdbRating}
    />
  );
}

export function useMovieImdbFeature() {
  const context = useContext(MovieImdbContext);

  if (!context) {
    throw new Error('Movie IMDb components must be inside MovieImdbProvider.');
  }

  return context;
}
