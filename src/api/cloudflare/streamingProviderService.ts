import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SubscriptionCategory,
  SubscriptionRoute,
} from './subscriptionRoutes';

const STREAMING_PROVIDERS_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/streaming-providers';
const CACHE_KEY_PREFIX = '@MovieApp:streaming-provider-catalog:v1:';
const REQUEST_TIMEOUT_MS = 10000;
const categories = new Set<SubscriptionCategory>([
  'direct',
  'prime_video_channels',
  'disney_plus',
  'apple_tv_channels',
  'roku_channels',
]);

type ProviderCatalogResponse = {
  region: string;
  providers: SubscriptionRoute[];
};

function safeHomepage(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || value.length > 2048 || /[\s\\]/.test(value))
    throw new Error('Provider catalog contains an invalid homepage.');
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new Error('Provider catalog contains an unsafe homepage.');
  }
  return url.href;
}

function validateProvider(value: unknown): SubscriptionRoute {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Provider catalog contains an invalid provider.');
  }
  const row = value as Record<string, unknown>;
  if (
    !Number.isSafeInteger(row.tmdbProviderId) ||
    Number(row.tmdbProviderId) <= 0 ||
    typeof row.providerName !== 'string' ||
    row.providerName.length === 0 ||
    row.providerName.length > 100 ||
    row.providerKey !== `tmdb_${row.tmdbProviderId}` ||
    typeof row.displayServiceName !== 'string' ||
    row.displayServiceName.length === 0 ||
    row.displayServiceName.length > 100 ||
    !categories.has(row.subscriptionCategory as SubscriptionCategory) ||
    (row.playbackPlatform !== null &&
      (typeof row.playbackPlatform !== 'string' ||
        !/^[a-z][a-z0-9_]{0,63}$/.test(row.playbackPlatform))) ||
    typeof row.launchAvailable !== 'boolean'
  ) {
    throw new Error('Provider catalog contains invalid routing information.');
  }
  return {
    tmdbProviderId: Number(row.tmdbProviderId),
    providerName: row.providerName,
    providerKey: row.providerKey,
    displayServiceName: row.displayServiceName,
    subscriptionCategory: row.subscriptionCategory as SubscriptionCategory,
    playbackPlatform: row.playbackPlatform as string | null,
    officialHomepageUrl: safeHomepage(row.officialHomepageUrl),
    launchAvailable: row.launchAvailable,
  };
}

function validateResponse(
  value: unknown,
  expectedRegion: string,
): ProviderCatalogResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Provider catalog response is invalid.');
  }
  const response = value as Record<string, unknown>;
  if (response.region !== expectedRegion || !Array.isArray(response.providers)) {
    throw new Error('Provider catalog response does not match the requested region.');
  }
  if (response.providers.length > 5000) {
    throw new Error('Provider catalog response is too large.');
  }
  const providers = response.providers.map(validateProvider);
  if (new Set(providers.map(provider => provider.tmdbProviderId)).size !== providers.length) {
    throw new Error('Provider catalog contains duplicate provider IDs.');
  }
  return { region: expectedRegion, providers };
}

export async function fetchStreamingProviderCatalog(
  requestedRegion: string,
  signal?: AbortSignal,
): Promise<SubscriptionRoute[]> {
  const region = requestedRegion.toUpperCase();
  if (!/^[A-Z]{2}$/.test(region)) throw new Error('Invalid provider region.');
  const cacheKey = `${CACHE_KEY_PREFIX}${region}`;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, REQUEST_TIMEOUT_MS);
  try {
    const query = new URLSearchParams({ region });
    const response = await fetch(`${STREAMING_PROVIDERS_URL}?${query}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Provider catalog request failed.');
    const catalog = validateResponse(await response.json(), region);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(catalog)).catch(() => {});
    return catalog.providers;
  } catch (error) {
    // A screen-navigation cancellation should stop immediately. A request
    // timeout can still use the last catalog saved on this device.
    if (signal?.aborted) throw error;
    const saved = await AsyncStorage.getItem(cacheKey).catch(() => null);
    if (!saved) throw error;
    return validateResponse(JSON.parse(saved), region).providers;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
