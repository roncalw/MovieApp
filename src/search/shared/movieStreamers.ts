/**
 * TMDb provider IDs for every subscription streamer MovieApp currently offers
 * in Advanced Search.
 *
 * Home's Streaming Now row, the Advanced Search popup, and the Worker request
 * builder all use these same IDs. Keeping them here prevents one part of the
 * app from silently treating a different provider list as "all streamers."
 */
export const MOVIE_STREAMER_PROVIDER_IDS = {
  netflix: '8',
  hulu: '15',
  prime: '9',
  max: '1899',
  youtube: '192',
  disneyPlus: '337',
  appleTvPlus: '350',
  peacock: '387',
  amcPlus: '526',
  paramountPlus: '531',
} as const;

export const ALL_MOVIE_STREAMER_PROVIDER_IDS = Object.values(
  MOVIE_STREAMER_PROVIDER_IDS,
);
