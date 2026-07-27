/**
 * Observable TMDB movie image with a local fallback and bounded retry policy.
 *
 * A changed React `key` recreates the native image view for a retry without
 * changing the public TMDB URL. That matters on Android because submitting the
 * same source to an existing native image view does not start a new request.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  type ImageErrorEvent,
  type ImageProps,
} from 'react-native';
import {
  recordMovieImageFailure,
  recordMovieImageSuccess,
  reportMovieImageDiagnostic,
} from '../../utils/movieImageLoading';

const MAX_AUTOMATIC_RETRIES = 2;
const RETRY_DELAY_MS = 350;

type MovieRemoteImageProps = Omit<
  ImageProps,
  'source' | 'defaultSource' | 'onError' | 'onLoad' | 'onLoadEnd' | 'onLoadStart'
> & {
  uri: string | undefined;
  fallbackSource: NonNullable<ImageProps['defaultSource']>;
  movieId?: number;
  diagnosticContext: string;
  refreshGeneration?: number;
};

type MovieImageStatus = 'loading' | 'loaded' | 'failed';

export function MovieRemoteImage({
  uri,
  fallbackSource,
  movieId,
  diagnosticContext,
  refreshGeneration = 0,
  ...imageProps
}: MovieRemoteImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<MovieImageStatus>(
    uri ? 'loading' : 'failed',
  );
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousRefreshGenerationRef = useRef(refreshGeneration);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearRetryTimer();
    setAttempt(0);
    setStatus(uri ? 'loading' : 'failed');
  }, [clearRetryTimer, uri]);

  useEffect(() => {
    if (previousRefreshGenerationRef.current === refreshGeneration) {
      return;
    }

    previousRefreshGenerationRef.current = refreshGeneration;

    if (uri && status === 'failed') {
      clearRetryTimer();
      setAttempt(currentAttempt => currentAttempt + 1);
      setStatus('loading');
    }
  }, [clearRetryTimer, refreshGeneration, status, uri]);

  useEffect(() => clearRetryTimer, [clearRetryTimer]);

  const handleLoadStart = useCallback(() => {
    if (!uri) {
      return;
    }

    reportMovieImageDiagnostic('load-start', {
      attempt,
      context: diagnosticContext,
      movieId,
      uri,
    });
  }, [attempt, diagnosticContext, movieId, uri]);

  const handleLoad = useCallback(() => {
    if (!uri) {
      return;
    }

    clearRetryTimer();
    recordMovieImageSuccess(uri);
    setStatus('loaded');
    reportMovieImageDiagnostic('load-success', {
      attempt,
      context: diagnosticContext,
      movieId,
      uri,
    });
  }, [attempt, clearRetryTimer, diagnosticContext, movieId, uri]);

  const handleLoadEnd = useCallback(() => {
    if (!uri) {
      return;
    }

    reportMovieImageDiagnostic('load-end', {
      attempt,
      context: diagnosticContext,
      movieId,
      uri,
    });
  }, [attempt, diagnosticContext, movieId, uri]);

  const handleError = useCallback(
    (event: ImageErrorEvent) => {
      if (!uri) {
        return;
      }

      recordMovieImageFailure(uri);
      reportMovieImageDiagnostic('load-failed', {
        attempt,
        context: diagnosticContext,
        error: event.nativeEvent.error,
        movieId,
        uri,
      });

      if (attempt >= MAX_AUTOMATIC_RETRIES) {
        setStatus('failed');
        return;
      }

      clearRetryTimer();
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        setAttempt(currentAttempt => currentAttempt + 1);
        setStatus('loading');
      }, RETRY_DELAY_MS);
    },
    [attempt, clearRetryTimer, diagnosticContext, movieId, uri],
  );

  if (!uri || status === 'failed') {
    return <Image {...imageProps} source={fallbackSource} />;
  }

  return (
    <Image
      key={`${uri}:${attempt}`}
      {...imageProps}
      onError={handleError}
      onLoad={handleLoad}
      onLoadEnd={handleLoadEnd}
      onLoadStart={handleLoadStart}
      source={{ uri }}
    />
  );
}
