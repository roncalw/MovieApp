/**
 * MovieApp receives provider route data from Cloudflare D1. This file defines
 * the public shape and presentation behavior; it contains no provider IDs or
 * provider homepages.
 */
export type PlaybackPlatform = string;

export const subscriptionCategories = [
  { key: 'direct', label: 'Direct Subscriptions' },
  { key: 'prime_video_channels', label: 'Prime Video Channels' },
  { key: 'disney_plus', label: 'Disney+' },
  { key: 'apple_tv_channels', label: 'Apple TV Channels' },
  { key: 'roku_channels', label: 'The Roku Channel' },
] as const;

export type SubscriptionCategory =
  (typeof subscriptionCategories)[number]['key'];

export type WatchMonetizationType =
  | 'flatrate'
  | 'ads'
  | 'free'
  | 'rent'
  | 'buy';

export type SubscriptionRoute = {
  tmdbProviderId: number;
  providerName: string;
  providerKey: string;
  displayServiceName: string;
  subscriptionCategory: SubscriptionCategory;
  playbackPlatform: PlaybackPlatform | null;
  officialHomepageUrl: string | null;
  launchAvailable: boolean;
};

export function subscriptionRouteForProviderId(
  id: number,
  routes: readonly SubscriptionRoute[],
): SubscriptionRoute | undefined {
  return routes.find(route => route.tmdbProviderId === id);
}

/** Keep a newly introduced TMDB provider visible until its D1 row is configured. */
export function unconfiguredSubscriptionRoute(
  id: number,
  name: string,
): SubscriptionRoute {
  const suffixes: [RegExp, SubscriptionCategory, string][] = [
    [/\s+Amazon Channels?\s*$/i, 'prime_video_channels', 'prime'],
    [/\s+Apple TV channel\s*$/i, 'apple_tv_channels', 'apple'],
    [/\s+Roku Premium Channel\s*$/i, 'roku_channels', 'roku'],
  ];
  const match = suffixes.find(([pattern]) => pattern.test(name));
  return {
    tmdbProviderId: id,
    providerName: name,
    providerKey: `tmdb_${id}`,
    displayServiceName: match ? name.replace(match[0], '').trim() : name,
    subscriptionCategory: match?.[1] ?? 'direct',
    playbackPlatform: match?.[2] ?? null,
    officialHomepageUrl: null,
    launchAvailable: false,
  };
}

export function subscriptionRouteLabel(route: SubscriptionRoute): string {
  if (route.subscriptionCategory === 'direct') return route.displayServiceName;
  const category = subscriptionCategories.find(
    value => value.key === route.subscriptionCategory,
  );
  return `${route.displayServiceName} through ${
    category?.label ?? route.subscriptionCategory
  }`;
}
