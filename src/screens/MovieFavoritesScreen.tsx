import React from 'react';
import { StoredMovieListScreen } from './StoredMovieListScreen';
import { MOVIE_FAVORITES_STORAGE_KEY } from '../storage/movieUserListsStorage';

export function MovieFavoritesScreen() {
  return (
    <StoredMovieListScreen
      title="Movie Favorites"
      emptyMessage="No favorite movies yet."
      storageKey={MOVIE_FAVORITES_STORAGE_KEY}
    />
  );
}
