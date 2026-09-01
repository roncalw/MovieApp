import type { movieWatchProviderType } from '../../types/movie/MovieTypes';
import {
  subscriptionCategories,
  subscriptionRouteForProviderId,
  subscriptionRoutes,
  unconfiguredSubscriptionRoute,
  type SubscriptionRoute,
} from '../../api/cloudflare/subscriptionRoutes';

export type RoutedWatchProvider = movieWatchProviderType & {
  route: SubscriptionRoute;
};

/** Group only this movie's TMDB rows. Equal names never merge different IDs. */
export function groupSubscriptionProviders(
  providers: readonly movieWatchProviderType[] = [],
  catalog: readonly SubscriptionRoute[] = subscriptionRoutes,
) {
  const unique = new Map<number, RoutedWatchProvider>();
  for (const provider of providers) {
    if (unique.has(provider.provider_id)) continue;
    const route =
      subscriptionRouteForProviderId(provider.provider_id, catalog) ??
      unconfiguredSubscriptionRoute(
        provider.provider_id,
        provider.provider_name,
      );
    unique.set(provider.provider_id, { ...provider, route });
  }
  return subscriptionCategories
    .map(category => ({
      ...category,
      providers: [...unique.values()]
        .filter(
          provider => provider.route.subscriptionCategory === category.key,
        )
        .sort(
          (a, b) =>
            a.route.displayServiceName.localeCompare(
              b.route.displayServiceName,
              'en',
            ) || a.provider_id - b.provider_id,
        ),
    }))
    .filter(group => group.providers.length > 0);
}
