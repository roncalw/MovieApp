import {
  subscriptionRouteForProviderId,
  subscriptionRouteLabel,
} from '../../api/cloudflare/subscriptionRoutes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  fetchStreamingLink,
  isStreamingProvider,
} from '../../api/cloudflare/streamingLinkService';
import { launchStreamingProvider } from './launchStreamingProvider';

export function useStreamingProviderLaunch(movieId: number, region: string) {
  const isFocused = useIsFocused();
  const focused = useRef(isFocused);
  focused.current = isFocused;
  const activeRequest = useRef<AbortController | null>(null);
  const [openingProviderId, setOpeningProviderId] = useState<number | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setOpeningProviderId(null);
    setMessage(null);
    return () => {
      // Navigating away can leave a detail screen mounted underneath another
      // screen. Cancel on loss of focus too, so a late reply cannot open another app.
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [movieId, region, isFocused]);

  const openProvider = useCallback(
    async (providerId: number) => {
      if (
        !isStreamingProvider(providerId) ||
        activeRequest.current ||
        !focused.current
      )
        return;
      const route = subscriptionRouteForProviderId(providerId)!;
      const providerName = subscriptionRouteLabel(route);
      const controller = new AbortController();
      activeRequest.current = controller;
      setOpeningProviderId(providerId);
      setMessage(null);
      try {
        const result = await fetchStreamingLink(
          { tmdbId: movieId, providerId, region },
          controller.signal,
        );
        if (
          controller.signal.aborted ||
          activeRequest.current !== controller ||
          !focused.current
        )
          return;
        if (!result.resolved) {
          setMessage(
            result.reason === 'no_match'
              ? `An exact ${providerName} link is not available for this movie yet.`
              : `The ${providerName} link is temporarily unavailable. Tap ${providerName} to try again.`,
          );
          return;
        }
        const destination = await launchStreamingProvider(
          result,
          controller.signal,
        );
        if (__DEV__) {
          console.info('[streaming-link]', {
            movieId,
            tmdbProviderId: providerId,
            displayServiceName: route.displayServiceName,
            subscriptionCategory: route.subscriptionCategory,
            playbackPlatform: route.playbackPlatform,
            region,
            providerContentId: result.providerContentId,
            source: result.source,
            cacheHit: result.cacheHit,
            destination,
            finalLaunchUrl:
              destination === 'native' ? result.nativeUrl : result.webUrl,
          });
        }
      } catch {
        if (
          !controller.signal.aborted &&
          activeRequest.current === controller &&
          focused.current
        ) {
          setMessage(`${providerName} could not be opened. Please try again.`);
        }
      } finally {
        if (activeRequest.current === controller) {
          activeRequest.current = null;
          setOpeningProviderId(null);
        }
      }
    },
    [movieId, region],
  );

  return { openProvider, openingProviderId, message };
}
