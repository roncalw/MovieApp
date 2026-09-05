import {
  adapterForRoute,
  destinationForRouteFromUrl,
  safeHttpsUrl,
  type StreamingProvider,
} from './streamingProviderCatalog';
import {
  type SubscriptionRoute,
  type WatchMonetizationType,
} from './subscriptionRoutes';
/**
 * Resolves the movie the user tapped, through MovieApp's Worker. This is called
 * on a tap rather than during rendering: simply viewing a detail screen must
 * not consume a backup API request. The API key lives only in Cloudflare.
 */
export type StreamingLinkRequest = {
  tmdbId: number;
  providerId: number;
  region: string;
  monetizationType: WatchMonetizationType;
};

export type StreamingLinkResult = StreamingLinkRequest &
  (
    | {
        resolved: true;
        destinationType: 'exact';
        provider: StreamingProvider;
        providerContentId: string;
        nativeUrl: string | null;
        webUrl: string;
        source: 'wikidata' | 'streaming-availability';
        cacheHit: boolean;
        // Older direct-provider responses remain compatible during deployment.
        // Routed responses must include and match all four identity fields.
        providerKey?: string;
        displayServiceName?: string;
        subscriptionCategory?: SubscriptionRoute['subscriptionCategory'];
        playbackPlatform?: SubscriptionRoute['playbackPlatform'];
      }
    | {
        resolved: true;
        destinationType: 'provider_homepage';
        provider: StreamingProvider | null;
        providerContentId: null;
        nativeUrl: null;
        webUrl: string;
        source: 'provider-homepage';
        cacheHit: false;
        providerKey: string;
        displayServiceName: string;
        subscriptionCategory: SubscriptionRoute['subscriptionCategory'];
        playbackPlatform: SubscriptionRoute['playbackPlatform'];
        fallbackReason: string;
      }
    | {
        resolved: false;
        provider: string | null;
        reason: string;
      }
  );

const STREAMING_LINK_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/streaming-link';
const REQUEST_TIMEOUT_MS = 20000;

export function isSafeStreamingDestination(
  result: StreamingLinkResult,
  expectedRoute: SubscriptionRoute,
): boolean {
  if (!result.resolved) return false;
  if (result.providerId !== expectedRoute.tmdbProviderId) return false;
  for (const key of [
    'providerKey',
    'displayServiceName',
    'subscriptionCategory',
    'playbackPlatform',
  ] as const) {
    if (result[key] !== expectedRoute[key]) return false;
  }
  if (result.destinationType === 'provider_homepage') {
    const homepage = safeHttpsUrl(result.webUrl)?.href ?? null;
    return (
      result.providerContentId === null &&
      result.nativeUrl === null &&
      homepage !== null &&
      homepage === expectedRoute.officialHomepageUrl
    );
  }
  const adapter = adapterForRoute(expectedRoute);
  if (!adapter || adapter.provider !== result.provider) return false;
  const destination = destinationForRouteFromUrl(expectedRoute, result.webUrl);
  return (
    destination !== null &&
    destination.providerContentId === result.providerContentId &&
    destination.webUrl === result.webUrl &&
    (result.nativeUrl === null || destination.nativeUrl === result.nativeUrl)
  );
}

export async function fetchStreamingLink(
  request: StreamingLinkRequest,
  expectedRoute: SubscriptionRoute,
  signal?: AbortSignal,
): Promise<StreamingLinkResult> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, REQUEST_TIMEOUT_MS);
  try {
    const query = new URLSearchParams({
      tmdbId: String(request.tmdbId),
      providerId: String(request.providerId),
      region: request.region,
      monetizationType: request.monetizationType,
    });
    const response = await fetch(`${STREAMING_LINK_URL}?${query}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Streaming destination lookup failed.');
    const result = (await response.json()) as StreamingLinkResult;
    if (
      !result ||
      result.tmdbId !== request.tmdbId ||
      result.providerId !== request.providerId ||
      result.region !== request.region ||
      result.monetizationType !== request.monetizationType ||
      typeof result.resolved !== 'boolean' ||
      (result.resolved && !isSafeStreamingDestination(result, expectedRoute))
    ) {
      throw new Error(
        'Streaming destination did not match the selected movie.',
      );
    }
    return result;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
