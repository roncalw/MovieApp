/**
 * Coordinates poster readiness for the two Home loading phases.
 *
 * The hero and Popular Movies prepare together because they make up the first
 * screen the customer sees. Only after both are ready do the offscreen rows
 * begin their image work. This prevents eight lower sections from competing
 * with the first screen for native downloads and image decoding. The shared
 * image coordinator still combines work within each phase and deduplicates
 * repeated posters across categories.
 */
import { useEffect, useMemo, useState } from 'react';
import type { movieType } from '../types/movie/MovieTypes';
import {
  getMovieImageUri,
  type MovieImageSize,
} from '../utils/movieImages';
import { prepareMovieImageUris } from '../utils/movieImageLoading';
import type { HomeQueryState } from './homeLoading';
import {
  HOME_HERO_IMAGE_SIZE,
  HOME_POSTER_ROW_IMAGE_SIZE,
} from './homeImageSizes';

type HomeImagePreparation = {
  isReady: boolean;
  unavailableImageUris: ReadonlySet<string>;
};

type StoredHomeImagePreparation = HomeImagePreparation & {
  preparationKey: string;
};

const EMPTY_IMAGE_URI_SET: ReadonlySet<string> = new Set();

function buildPreparationKey(
  movies: movieType[] | undefined,
  refreshGeneration: number,
  imageSize: MovieImageSize,
) {
  const movieImageKeys = (movies ?? []).map(
    movie => `${movie.id}:${getMovieImageUri(movie, imageSize) ?? 'no-image'}`,
  );

  return `${refreshGeneration}:${movieImageKeys.join('|')}`;
}

function useHomeCollectionImagePreparation(
  query: HomeQueryState,
  refreshGeneration: number,
  imageSize: MovieImageSize,
  isEnabled = true,
): HomeImagePreparation {
  const preparationKey = useMemo(
    () => buildPreparationKey(query.data, refreshGeneration, imageSize),
    [imageSize, query.data, refreshGeneration],
  );
  const [storedPreparation, setStoredPreparation] =
    useState<StoredHomeImagePreparation | null>(null);

  useEffect(() => {
    if (!isEnabled || query.isLoading || query.isError) {
      return undefined;
    }

    let isCancelled = false;

    const imageUris = (query.data ?? [])
      .map(movie => getMovieImageUri(movie, imageSize))
      .filter((uri): uri is string => Boolean(uri));

    void prepareMovieImageUris(imageUris).then(result => {
      if (isCancelled) {
        return;
      }

      setStoredPreparation({
        preparationKey,
        isReady: true,
        unavailableImageUris: new Set(result.failedUris),
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [
    imageSize,
    isEnabled,
    preparationKey,
    query.data,
    query.isError,
    query.isLoading,
  ]);

  if (!isEnabled) {
    return {
      isReady: false,
      unavailableImageUris: EMPTY_IMAGE_URI_SET,
    };
  }

  if (query.isError) {
    return {
      isReady: true,
      unavailableImageUris: EMPTY_IMAGE_URI_SET,
    };
  }

  if (
    query.isLoading ||
    storedPreparation?.preparationKey !== preparationKey
  ) {
    return {
      isReady: false,
      unavailableImageUris: EMPTY_IMAGE_URI_SET,
    };
  }

  return storedPreparation;
}

/**
 * The number and order of Home sections are fixed. Keeping these hook calls
 * explicit guarantees stable React hook ordering while allowing the first two
 * collections to control when the remaining eight may begin.
 */
export function useHomeImagePreparations(
  queryStates: HomeQueryState[],
  refreshGeneration: number,
  secondaryPhaseAllowed = true,
) {
  const heroPreparation = useHomeCollectionImagePreparation(
    queryStates[0],
    refreshGeneration,
    HOME_HERO_IMAGE_SIZE,
  );
  const popularPreparation = useHomeCollectionImagePreparation(
    queryStates[1],
    refreshGeneration,
    HOME_POSTER_ROW_IMAGE_SIZE,
  );
  const isSecondaryPhaseEnabled = secondaryPhaseAllowed;

  return [
    heroPreparation,
    popularPreparation,
    useHomeCollectionImagePreparation(
      queryStates[2],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
    useHomeCollectionImagePreparation(
      queryStates[3],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
    useHomeCollectionImagePreparation(
      queryStates[4],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
    useHomeCollectionImagePreparation(
      queryStates[5],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
    useHomeCollectionImagePreparation(
      queryStates[6],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
    useHomeCollectionImagePreparation(
      queryStates[7],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
    useHomeCollectionImagePreparation(
      queryStates[8],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
    useHomeCollectionImagePreparation(
      queryStates[9],
      refreshGeneration,
      HOME_POSTER_ROW_IMAGE_SIZE,
      isSecondaryPhaseEnabled,
    ),
  ] as const;
}
