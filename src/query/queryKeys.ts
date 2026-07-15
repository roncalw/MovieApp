/**
 * Canonical TanStack Query cache keys for MovieApp.
 *
 * A query hook and every screen that invalidates, removes, or refetches that
 * query must use the same key. Keeping the keys here prevents a spelling change
 * in one file from silently making pull-to-refresh or search reset target the
 * wrong cache entry.
 */
import type { MovieSearchParams } from '../types/search/movieSearchParams';
import type { HomeMovieGenreId } from '../types/tmdb/tmdbApiTypes';

const MOVIE_SEARCH_ROOT = ['movieSearch'] as const;
const MOVIE_TITLE_SEARCH_ROOT = ['movieTitleSearch'] as const;

export const queryKeys = {
  movieSearchRoot: MOVIE_SEARCH_ROOT,
  movieSearch: (params: MovieSearchParams) =>
    [...MOVIE_SEARCH_ROOT, params] as const,

  movieTitleSearchRoot: MOVIE_TITLE_SEARCH_ROOT,
  movieTitleSearch: (title: string) =>
    [...MOVIE_TITLE_SEARCH_ROOT, title] as const,

  movieCoreDetails: (movieId: number | null) =>
    ['movieCoreDetails', movieId] as const,
  movieVideos: (movieId: number | null) => ['movieVideos', movieId] as const,
  movieExternalIds: (movieId: number | null) =>
    ['movieExternalIds', movieId] as const,
  movieWatchProviders: (movieId: number | null) =>
    ['movieWatchProviders', movieId] as const,
  movieListImdbRating: (movieId: number | null) =>
    ['movieListImdbRating', movieId] as const,

  personCoreDetails: (personId: number | null) =>
    ['personCoreDetails', personId] as const,
  personFamily: (wikidataId: string | null) =>
    ['personFamily', wikidataId] as const,
  personMovieCredits: (personId: number | null) =>
    ['personMovieCredits', personId] as const,

  popularMovies: ['popularMovies'] as const,
  upcomingMovies: ['upcomingMovies'] as const,
  homeGenreMovies: (rowKey: string, genreId: HomeMovieGenreId) =>
    ['homeGenreMovies', rowKey, genreId] as const,
};
