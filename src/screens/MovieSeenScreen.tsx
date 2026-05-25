import React from 'react';
import { StoredMovieListScreen } from './StoredMovieListScreen';
import { MOVIE_SEEN_STORAGE_KEY } from '../storage/movieUserListsStorage';

export function MovieSeenScreen() {
  return (
    <StoredMovieListScreen
      title="I Have Seen"
      emptyMessage="No seen movies yet."
      storageKey={MOVIE_SEEN_STORAGE_KEY}
    />
  );
}
