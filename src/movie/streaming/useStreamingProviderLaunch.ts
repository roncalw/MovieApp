import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { fetchStreamingLink } from '../../api/cloudflare/streamingLinkService';
import {
  subscriptionRouteLabel,
  type SubscriptionRoute,
  type WatchMonetizationType,
} from '../../api/cloudflare/subscriptionRoutes';
import { launchStreamingProvider } from './launchStreamingProvider';

export function useStreamingProviderLaunch(movieId: number, region: string) {
  const isFocused = useIsFocused();
  const focused = useRef(isFocused);
  const activeRequest = useRef<AbortController | null>(null);
  const [openingProviderId, setOpeningProviderId] = useState<number | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    focused.current = isFocused;
    if (!isFocused) {
      activeRequest.current?.abort();
      activeRequest.current = null;
      setOpeningProviderId(null);
      setMessage(null);
    }
  }, [isFocused]);

  useEffect(() => {
    return () => {
      focused.current = false;
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [movieId, region]);

  const openProvider = useCallback(
    async (
      providerId: number,
      monetizationType: WatchMonetizationType,
      route: SubscriptionRoute,
    ) => {
      if (!route.launchAvailable || activeRequest.current || !focused.current) {
        return;
      }
      const providerName = subscriptionRouteLabel(route);
      const controller = new AbortController();
      activeRequest.current = controller;
      setOpeningProviderId(providerId);
      setMessage(null);
      try {
        const result = await fetchStreamingLink(
          { tmdbId: movieId, providerId, region, monetizationType },
          route,
          controller.signal,
        );
        if (
          controller.signal.aborted ||
          activeRequest.current !== controller ||
          !focused.current
        ) {
          return;
        }
        if (!result.resolved) {
          setMessage(
            result.reason === 'no_match'
              ? `A ${providerName} destination is not available for this movie yet.`
              : `The ${providerName} link is temporarily unavailable. Tap ${providerName} to try again.`,
          );
          return;
        }

        const destination =
          result.destinationType === 'provider_homepage'
            ? await Linking.openURL(result.webUrl).then(() => 'web' as const)
            : await launchStreamingProvider(result, route, controller.signal);

        if (__DEV__) {
          console.info('[streaming-link]', {
            movieId,
            tmdbProviderId: providerId,
            displayServiceName: route.displayServiceName,
            subscriptionCategory: route.subscriptionCategory,
            playbackPlatform: route.playbackPlatform,
            monetizationType,
            providerContentId: result.providerContentId,
            source: result.source,
            cacheHit: result.cacheHit,
            destination,
            finalLaunchUrl:
              result.destinationType === 'provider_homepage' ||
              destination === 'web'
                ? result.webUrl
                : result.nativeUrl,
          });
        }
      } catch {
        if (
          !controller.signal.aborted &&
          activeRequest.current === controller &&
          focused.current
        ) {
          setMessage(
            `The ${providerName} link is temporarily unavailable. Tap ${providerName} to try again.`,
          );
        }
      } finally {
        if (activeRequest.current === controller) {
          activeRequest.current = null;
          if (focused.current) setOpeningProviderId(null);
        }
      }
    },
    [movieId, region],
  );

  return { openingProviderId, message, openProvider };
}
