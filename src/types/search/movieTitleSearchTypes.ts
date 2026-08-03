/**
 * Type definitions for Search by Movie Title.
 *
 * Title search loads TMDB results first and then adds the two values shown or
 * used by each poster card: its IMDb rating and its subscription availability.
 * Keeping those answers by TMDB movie id lets cards update in small groups
 * without making the initial TMDB results wait for every Cloudflare request.
 */

export type MovieCardDisplayData = {
  imdbRating: number | null;
  availableWithSubscription: boolean | null;
  availableWithoutRentOrPurchase: boolean | null;
};

export type MovieCardDataById = Record<
  number,
  MovieCardDisplayData | undefined
>;
