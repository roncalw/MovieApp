import {
  adapterForProviderId,
  destinationForRouteFromUrl,
  type StreamingProvider,
} from './streamingProviderCatalog';
import {
  subscriptionRouteForProviderId,
  type SubscriptionRoute,
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
};

export type StreamingLinkResult = StreamingLinkRequest &
  (
    | {
        resolved: true;
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
        resolved: false;
        provider: string | null;
        reason: string;
      }
  );

const STREAMING_LINK_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/streaming-link';
const REQUEST_TIMEOUT_MS = 20000;

export function isStreamingProvider(providerId: number): boolean {
  return adapterForProviderId(providerId) !== undefined;
}

export function isSafeStreamingDestination(
  result: StreamingLinkResult,
): boolean {
  if (!result.resolved) return false;
  const adapter = adapterForProviderId(result.providerId);
  if (!adapter || adapter.provider !== result.provider) return false;
  const route = subscriptionRouteForProviderId(result.providerId)!;
  for (const key of [
    'providerKey',
    'displayServiceName',
    'subscriptionCategory',
    'playbackPlatform',
  ] as const) {
    if (result[key] === undefined && route.subscriptionCategory === 'direct')
      continue;
    if (result[key] !== route[key]) return false;
  }
  const destination = destinationForRouteFromUrl(route, result.webUrl);
  return (
    destination !== null &&
    destination.providerContentId === result.providerContentId &&
    destination.webUrl === result.webUrl &&
    (result.nativeUrl === null || destination.nativeUrl === result.nativeUrl)
  );
}

export async function fetchStreamingLink(
  request: StreamingLinkRequest,
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
      typeof result.resolved !== 'boolean' ||
      (result.resolved && !isSafeStreamingDestination(result))
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
