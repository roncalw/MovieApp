/**
 * Shared preparation and failure tracking for remote TMDB movie images.
 *
 * Image.prefetch downloads the compressed file into the platform image cache.
 * Preparing the unique URLs before publishing a Home snapshot prevents nine
 * independently finishing movie queries from exposing half-prepared rows.
 */
import { Image, Platform } from 'react-native';
import type { MovieImageFields } from '../types/movie/movieImageTypes';
import { getMovieImageUri } from './movieImages';

export const MOVIE_IMAGE_PREPARATION_TIMEOUT_MS = 10_000;

const failedMovieImageUris = new Set<string>();

export type MovieImagePreparationResult = {
  requestedCount: number;
  prefetchCount: number;
  failedUris: string[];
  timedOut: boolean;
};

export function getUniqueMovieImageUris(
  collections: ReadonlyArray<ReadonlyArray<MovieImageFields> | undefined>,
) {
  return [
    ...new Set(
      collections.flatMap(collection =>
        (collection ?? [])
          .map(movie => getMovieImageUri(movie))
          .filter((uri): uri is string => Boolean(uri)),
      ),
    ),
  ];
}

export function recordMovieImageFailure(uri: string) {
  failedMovieImageUris.add(uri);
}

export function recordMovieImageSuccess(uri: string) {
  failedMovieImageUris.delete(uri);
}

export function getFailedMovieImageUris() {
  return new Set(failedMovieImageUris);
}

export async function prepareMovieImages(
  collections: ReadonlyArray<ReadonlyArray<MovieImageFields> | undefined>,
  timeoutMs = MOVIE_IMAGE_PREPARATION_TIMEOUT_MS,
): Promise<MovieImagePreparationResult> {
  return prepareMovieImageUris(getUniqueMovieImageUris(collections), timeoutMs);
}

export async function prepareMovieImageUris(
  imageUris: ReadonlyArray<string>,
  timeoutMs = MOVIE_IMAGE_PREPARATION_TIMEOUT_MS,
): Promise<MovieImagePreparationResult> {
  const uniqueUris = [...new Set(imageUris.filter(Boolean))];

  if (uniqueUris.length === 0) {
    return {
      requestedCount: 0,
      prefetchCount: 0,
      failedUris: [],
      timedOut: false,
    };
  }

  let cachedUris: Record<string, 'memory' | 'disk' | 'disk/memory'> = {};

  try {
    cachedUris = Image.queryCache
      ? await Image.queryCache(uniqueUris)
      : {};
  } catch (error) {
    reportMovieImageDiagnostic('cache-query-failed', {
      error: getErrorMessage(error),
      imageCount: uniqueUris.length,
    });
  }

  const urisToPrefetch = uniqueUris.filter(
    uri => !cachedUris[uri] || failedMovieImageUris.has(uri),
  );
  const failedDuringPreparation = new Set<string>();
  const preparation = Promise.allSettled(
    urisToPrefetch.map(async uri => {
      const wasPrefetched = await Image.prefetch(uri);

      if (!wasPrefetched) {
        throw new Error('The native image cache did not accept the image.');
      }

      return uri;
    }),
  ).then(results => {
    results.forEach((result, index) => {
      const uri = urisToPrefetch[index];

      if (result.status === 'fulfilled') {
        recordMovieImageSuccess(uri);
        return;
      }

      failedDuringPreparation.add(uri);
      recordMovieImageFailure(uri);
      reportMovieImageDiagnostic('prefetch-failed', {
        error: getErrorMessage(result.reason),
        uri,
      });
    });
  });

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timedOut = await Promise.race([
    preparation.then(() => false),
    new Promise<true>(resolve => {
      timeoutId = setTimeout(() => resolve(true), timeoutMs);
    }),
  ]);

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (timedOut) {
    urisToPrefetch.forEach(recordMovieImageFailure);
    reportMovieImageDiagnostic('preparation-timeout', {
      imageCount: urisToPrefetch.length,
      timeoutMs,
    });
  }

  return {
    requestedCount: uniqueUris.length,
    prefetchCount: urisToPrefetch.length,
    failedUris: timedOut
      ? [...urisToPrefetch]
      : [...failedDuringPreparation],
    timedOut,
  };
}

export function reportMovieImageDiagnostic(
  event: string,
  details: Record<string, unknown>,
) {
  const diagnostic = {
    event,
    platform: Platform.OS,
    ...details,
  };

  if (__DEV__) {
    console.info('[Movie image]', diagnostic);
    return;
  }

  if (event.includes('failed') || event.includes('timeout')) {
    console.error('[Movie image]', diagnostic);
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
