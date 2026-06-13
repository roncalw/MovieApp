import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getStoredMovieListCount } from '../../utils/storage/movieUserListsStorage';
import type { MovieUserListStorageKey } from '../../types/movie/movieUserListTypes';

export function useStoredMovieListCount(storageKey: MovieUserListStorageKey) {
  const [count, setCount] = useState<number | null>(null);

  const refreshCount = useCallback(async () => {
    const nextCount = await getStoredMovieListCount(storageKey);
    setCount(nextCount);
  }, [storageKey]);

  useFocusEffect(
    useCallback(() => {
      void refreshCount();
    }, [refreshCount])
  );

  return {
    count,
    refreshCount,
  };
}
