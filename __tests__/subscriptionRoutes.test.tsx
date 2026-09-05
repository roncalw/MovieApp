import React from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
} from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { MovieDetailInfoSections } from '../src/movie/components/MovieDetailInfoSections';
import { groupSubscriptionProviders } from '../src/movie/streaming/groupSubscriptionProviders';
import { ScrollFriendlyTapTarget } from '../src/shared/ScrollFriendlyTapTarget';
import {
  useMovieWatchProvidersQuery,
  useStreamingProviderCatalogQuery,
} from '../src/hooks/useMovieSearchQuery';
import type { SubscriptionRoute } from '../src/api/cloudflare/subscriptionRoutes';
import type {
  movieType,
  movieWatchProviderType,
} from '../src/types/movie/MovieTypes';

jest.mock('../src/hooks/useMovieSearchQuery', () => ({
  useMovieWatchProvidersQuery: jest.fn(),
  useStreamingProviderCatalogQuery: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn(() => true),
}));

const provider = (
  provider_id: number,
  provider_name: string,
): movieWatchProviderType => ({ provider_id, provider_name, logo_path: null });

const route = ({
  tmdbProviderId,
  displayServiceName,
  playbackPlatform,
  subscriptionCategory = 'direct',
  officialHomepageUrl = null,
  launchAvailable = true,
}: {
  tmdbProviderId: number;
  displayServiceName: string;
  playbackPlatform: string;
  subscriptionCategory?: SubscriptionRoute['subscriptionCategory'];
  officialHomepageUrl?: string | null;
  launchAvailable?: boolean;
}): SubscriptionRoute => ({
  tmdbProviderId,
  providerName: displayServiceName,
  providerKey: `tmdb_${tmdbProviderId}`,
  displayServiceName,
  subscriptionCategory,
  playbackPlatform,
  officialHomepageUrl,
  launchAvailable,
});

const catalog: SubscriptionRoute[] = [
  route({
    tmdbProviderId: 73,
    displayServiceName: 'Tubi TV',
    playbackPlatform: 'tubi',
    officialHomepageUrl: 'https://tubitv.com/',
  }),
  route({
    tmdbProviderId: 526,
    displayServiceName: 'AMC+',
    playbackPlatform: 'amc',
    officialHomepageUrl: 'https://www.amcplus.com/',
  }),
  route({
    tmdbProviderId: 528,
    displayServiceName: 'AMC+',
    playbackPlatform: 'prime',
    subscriptionCategory: 'prime_video_channels',
    officialHomepageUrl: 'https://www.amazon.com/gp/video/storefront/',
  }),
  route({
    tmdbProviderId: 257,
    displayServiceName: 'fuboTV',
    playbackPlatform: 'fubo',
    officialHomepageUrl: 'https://www.fubo.tv/',
  }),
  route({
    tmdbProviderId: 10,
    displayServiceName: 'Amazon Video',
    playbackPlatform: 'prime',
    officialHomepageUrl: 'https://www.amazon.com/gp/video/storefront/',
  }),
];

const originalFetch = globalThis.fetch;
let tree: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  (useStreamingProviderCatalogQuery as jest.Mock).mockReturnValue({
    data: catalog,
  });
  (useMovieWatchProvidersQuery as jest.Mock).mockReturnValue({
    data: {
      results: {
        US: {
          ads: [provider(73, 'Tubi TV')],
          flatrate: [
            provider(526, 'AMC+'),
            provider(528, 'AMC+ Amazon Channel'),
            provider(257, 'fuboTV'),
            provider(990001, 'Example Subscription'),
          ],
          rent: [provider(10, 'Amazon Video')],
        },
      },
    },
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  });
});

afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  globalThis.fetch = originalFetch;
  jest.restoreAllMocks();
});

test('groups exact TMDB routes without merging direct and channel offers', () => {
  const groups = groupSubscriptionProviders(
    [
      provider(526, 'AMC+'),
      provider(528, 'AMC+ Amazon Channel'),
      provider(528, 'duplicate'),
    ],
    catalog,
  );
  expect(groups).toHaveLength(2);
  expect(groups[0]).toMatchObject({
    key: 'direct',
    providers: [{ route: { tmdbProviderId: 526 } }],
  });
  expect(groups[1]).toMatchObject({
    key: 'prime_video_channels',
    providers: [{ route: { tmdbProviderId: 528 } }],
  });
});

test('shows Watch Now on subscriptions, ad-supported offers, and rentals', async () => {
  let finish!: (value: unknown) => void;
  globalThis.fetch = jest.fn(
    () =>
      new Promise<unknown>(resolve => {
        finish = resolve;
      }),
  ) as typeof fetch;
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  act(() => {
    tree = TestRenderer.create(
      <MovieDetailInfoSections movieId={938614} movie={{} as movieType} />,
    );
  });

  const text = tree!.root.findAllByType(Text).map(node => node.props.children);
  expect(text).toContain('Direct Subscriptions');
  expect(text).toContain('Prime Video Channels');
  expect(text).not.toContain('Apple TV Channels');

  const watchLabels = tree!.root
    .findAllByType(Text)
    .filter(node => node.props.children === 'Watch Now');
  expect(watchLabels).toHaveLength(6);
  expect(StyleSheet.flatten(watchLabels[0].props.style).fontWeight).toBe('400');

  const links = tree!.root
    .findAllByType(ScrollFriendlyTapTarget)
    .filter(node => node.props.accessibilityRole === 'link');
  expect(links).toHaveLength(5);
  const disabled = tree!.root.find(
    node =>
      node.props.accessibilityLabel ===
      'Watch now unavailable on Example Subscription',
  );
  expect(disabled.props.accessibilityState).toEqual({ disabled: true });

  const rent = links.find(
    node => node.props.accessibilityLabel === 'Open movie on Amazon Video',
  )!;
  act(() => rent.props.onPress());
  expect(rent.findAllByType(ActivityIndicator)).toHaveLength(1);
  expect(
    rent.findAllByType(Text).some(node => node.props.children === 'Watch Now'),
  ).toBe(false);
  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('monetizationType=rent'),
    expect.anything(),
  );
  const amazonRoute = catalog.find(item => item.tmdbProviderId === 10)!;
  await act(async () => {
    finish({
      ok: true,
      json: async () => ({
        tmdbId: 938614,
        providerId: 10,
        region: 'US',
        monetizationType: 'rent',
        resolved: true,
        destinationType: 'provider_homepage',
        provider: 'prime',
        providerKey: amazonRoute.providerKey,
        displayServiceName: amazonRoute.displayServiceName,
        subscriptionCategory: amazonRoute.subscriptionCategory,
        playbackPlatform: amazonRoute.playbackPlatform,
        providerContentId: null,
        nativeUrl: null,
        webUrl: amazonRoute.officialHomepageUrl,
        source: 'provider-homepage',
        cacheHit: false,
        fallbackReason: 'no_match',
      }),
    });
  });
  expect(open).toHaveBeenCalledWith(
    'https://www.amazon.com/gp/video/storefront/',
  );
});
