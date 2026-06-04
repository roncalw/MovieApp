/**
 * Type definitions for TMDB and Cloudflare movie API responses.
 *
 * These types describe the data packets that come back from the outside movie
 * data services before the app displays them. At a high level, they are the
 * "shipping labels" on each API response: they tell TypeScript which fields are
 * expected, which fields can be missing, and how the service layer should hand
 * that data to screens and hooks.
 */

import type { movieSearchResults, movieType } from '../movie/MovieTypes';

export type MovieListResponse = {
  page: number;
  results: movieType[];
  total_pages: number;
  total_results: number;
};

export type MovieDetailsResponse = movieType;

export type HomeMovieGenreId = 18 | 27 | 35 | 80 | 99 | 10402 | 10751;

export type CloudflareMovieSearchItem = {
  tmdb_id: number;
  poster_path: string;
  imdb_rating: number | null;
};

export type CloudflareMovieSearchResponse = {
  movies: CloudflareMovieSearchItem[];
  nextCursor: string | null;
  pageSize: number;
  sort: string;
  beginDate: string;
  endDate: string;
};

export type CloudflareMovieListImdbRating = {
  tmdb_id: number;
  imdb_rating: number | null;
};

export type ImdbWebsiteRatingScrapeStatus =
  | 'rating_found'
  | 'imdb_challenge'
  | 'rating_not_found'
  | 'request_failed';

export type ImdbWebsiteRatingScrapeResult = {
  imdbRating: number | null;
  imdbVotes: string;
  status: ImdbWebsiteRatingScrapeStatus;
};

export type CloudflareMovieSearchResults = movieSearchResults & {
  nextCursor: string | null;
};

export type MovieTitleSearchResults = {
  movies: movieType[];
  page: number;
  totalPages: number;
  totalResults: number;
};
