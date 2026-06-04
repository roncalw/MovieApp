/**
 * Type definitions for drawer-owned screens.
 *
 * These props describe the small input contracts used by reusable drawer
 * screens. For example, the same stored-list screen can show either Favorites
 * or Movies I Have Seen because the caller provides the title, empty message,
 * and storage key.
 */

import type { MovieUserListStorageKey } from '../movie/movieUserListTypes';

export type PlaceholderScreenProps = {
  title: string;
};

export type StoredMovieListScreenProps = {
  title: string;
  emptyMessage: string;
  storageKey: MovieUserListStorageKey;
};
