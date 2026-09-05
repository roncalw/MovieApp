/**
 * Representative TMDB provider IDs for the twelve subscription services
 * displayed as their own logo tiles in Advanced Search.
 *
 * Home's Streaming Now row, the named Advanced Search tiles, and the Worker
 * request builder all use these same IDs. The Worker resolves a representative
 * ID to its existing D1 playback platform, so a named tile also matches the
 * platform's other direct plans. Smaller direct platforms are covered by Other.
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
  starz: '43',
  mgmPlus: '34',
} as const;

export const ALL_MOVIE_STREAMER_PROVIDER_IDS = Object.values(
  MOVIE_STREAMER_PROVIDER_IDS,
);

/**
 * This is a search choice, not a TMDB provider ID. It asks the Worker for
 * direct subscription providers other than the twelve services shown
 * separately in Advanced Search.
 */
export const OTHER_DIRECT_STREAMERS_VALUE = 'other_direct';

/** Every tile selected by Advanced Search's Add All action. */
export const ALL_MOVIE_STREAMER_SELECTION_VALUES = [
  ...ALL_MOVIE_STREAMER_PROVIDER_IDS,
  OTHER_DIRECT_STREAMERS_VALUE,
];
