/**
 * Shared preparation and failure tracking for remote TMDB movie images.
 *
 * Image.prefetch downloads one compressed file into the platform image cache.
 * Search refresh flows prepare a replacement result page before publishing it.
 * Home prepares its hero and rows independently, while the coordinator below
 * combines cache checks started together and shares one in-progress operation
 * for every unique URL. A repeated movie therefore cannot start duplicate
 * downloads merely because it appears in more than one Home category.
 */
import { Image, Platform } from 'react-native';
import type { MovieImageFields } from '../types/movie/movieImageTypes';
import { getMovieImageUri } from './movieImages';

export const MOVIE_IMAGE_PREPARATION_TIMEOUT_MS = 10_000;

const failedMovieImageUris = new Set<string>();

type MovieImagePreparationOutcome = {
  failed: boolean;
  prefetched: boolean;
};

type QueuedMovieImagePreparation = {
  promise: Promise<MovieImagePreparationOutcome>;
  resolve: (outcome: MovieImagePreparationOutcome) => void;
};

/*
 * These maps coordinate every caller in the current JavaScript process.
 *
 * Example:
 * - Popular Movies asks for poster A.
 * - Horror Movies asks for the same poster before Popular finishes.
 * - Horror receives Popular's existing promise instead of starting another
 *   cache check and another native download for poster A.
 *
 * Newly requested URLs are kept in a short-lived queue. A resolved promise
 * schedules one microtask after the current synchronous work, allowing all Home
 * category effects from the same React commit to contribute their URLs before
 * the native cache is queried once for that combined set.
 */
const activeMovieImagePreparations = new Map<
  string,
  Promise<MovieImagePreparationOutcome>
>();
const queuedMovieImagePreparations = new Map<
  string,
  QueuedMovieImagePreparation
>();
let queuedPreparationFlush: Promise<void> | null = null;

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

  const preparations = uniqueUris.map(uri => ({
    uri,
    promise: getOrQueueMovieImagePreparation(uri),
  }));
  const preparation = Promise.all(
    preparations.map(({ promise }) => promise),
  );

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
    preparations.forEach(({ uri, promise }) => {
      recordMovieImageFailure(uri);

      // Native Image.prefetch cannot be cancelled. Removing only the matching
      // promise prevents a permanently hanging native call from leaking in the
      // coordinator or blocking a later explicit retry of the same URL.
      if (activeMovieImagePreparations.get(uri) === promise) {
        activeMovieImagePreparations.delete(uri);
      }
    });
    reportMovieImageDiagnostic('preparation-timeout', {
      imageCount: uniqueUris.length,
      timeoutMs,
    });
  }

  const outcomes = timedOut ? [] : await preparation;

  return {
    requestedCount: uniqueUris.length,
    prefetchCount: timedOut
      ? uniqueUris.length
      : outcomes.filter(outcome => outcome.prefetched).length,
    failedUris: timedOut
      ? uniqueUris
      : preparations
          .filter((_, index) => outcomes[index].failed)
          .map(({ uri }) => uri),
    timedOut,
  };
}

function getOrQueueMovieImagePreparation(uri: string) {
  const activePreparation = activeMovieImagePreparations.get(uri);

  if (activePreparation) {
    return activePreparation;
  }

  let resolvePreparation!: (outcome: MovieImagePreparationOutcome) => void;
  const preparation = new Promise<MovieImagePreparationOutcome>(resolve => {
    resolvePreparation = resolve;
  });

  activeMovieImagePreparations.set(uri, preparation);
  queuedMovieImagePreparations.set(uri, {
    promise: preparation,
    resolve: resolvePreparation,
  });
  scheduleQueuedMovieImagePreparations();

  return preparation;
}

function scheduleQueuedMovieImagePreparations() {
  if (queuedPreparationFlush) {
    return;
  }

  queuedPreparationFlush = Promise.resolve().then(async () => {
    queuedPreparationFlush = null;
    await flushQueuedMovieImagePreparations();
  });
}

async function flushQueuedMovieImagePreparations() {
  const queuedPreparations = new Map(queuedMovieImagePreparations);
  queuedMovieImagePreparations.clear();
  const queuedUris = [...queuedPreparations.keys()];

  if (queuedUris.length === 0) {
    return;
  }

  let cachedUris: Record<string, 'memory' | 'disk' | 'disk/memory'> = {};

  try {
    cachedUris = Image.queryCache
      ? await Image.queryCache(queuedUris)
      : {};
  } catch (error) {
    reportMovieImageDiagnostic('cache-query-failed', {
      error: getErrorMessage(error),
      imageCount: queuedUris.length,
    });
  }

  await Promise.all(
    queuedUris.map(async uri => {
      const queuedPreparation = queuedPreparations.get(uri);

      if (!queuedPreparation) {
        return;
      }

      if (cachedUris[uri] && !failedMovieImageUris.has(uri)) {
        recordMovieImageSuccess(uri);
        finishMovieImagePreparation(uri, queuedPreparation, {
          failed: false,
          prefetched: false,
        });
        return;
      }

      try {
        const wasPrefetched = await Image.prefetch(uri);

        if (!wasPrefetched) {
          throw new Error('The native image cache did not accept the image.');
        }

        recordMovieImageSuccess(uri);
        finishMovieImagePreparation(uri, queuedPreparation, {
          failed: false,
          prefetched: true,
        });
      } catch (error) {
        recordMovieImageFailure(uri);
        reportMovieImageDiagnostic('prefetch-failed', {
          error: getErrorMessage(error),
          uri,
        });
        finishMovieImagePreparation(uri, queuedPreparation, {
          failed: true,
          prefetched: true,
        });
      }
    }),
  );
}

function finishMovieImagePreparation(
  uri: string,
  queuedPreparation: QueuedMovieImagePreparation,
  outcome: MovieImagePreparationOutcome,
) {
  queuedPreparation.resolve(outcome);

  if (activeMovieImagePreparations.get(uri) === queuedPreparation.promise) {
    activeMovieImagePreparations.delete(uri);
  }
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
