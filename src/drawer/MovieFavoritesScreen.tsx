import React from 'react';
import { StoredMovieListScreen } from './StoredMovieListScreen';
import { MOVIE_FAVORITES_STORAGE_KEY } from '../utils/storage/movieUserListsStorage';

export function MovieFavoritesScreen() {
  return (
    <StoredMovieListScreen
      title="My Movie Favorites"
      emptyMessage="No favorite movies yet."
      storageKey={MOVIE_FAVORITES_STORAGE_KEY}
    />
  );
}
