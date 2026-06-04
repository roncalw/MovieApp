/**
 * Type definitions for locally saved movie lists.
 *
 * Favorites and Movies I Have Seen are stored on the device with AsyncStorage.
 * These types describe the storage key names and the compact movie shape saved
 * there. They intentionally represent local persisted data, not the full TMDB
 * detail response, so old saved movies can still be displayed as search-result
 * cards later.
 */

export type MovieUserListStorageKey = 'movieFavoritesData' | 'movieSeenData';

export type StoredMovieListItem = {
  id: number;
  adult: boolean;
  backdrop_path?: string;
  genres?: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};
