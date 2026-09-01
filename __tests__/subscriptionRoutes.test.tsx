import React from 'react';
import { ActivityIndicator, Linking, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import * as routes from '../src/api/cloudflare/subscriptionRoutes';
import { destinationForRouteFromUrl } from '../src/api/cloudflare/streamingProviderCatalog';
import {
  isSafeStreamingDestination,
  type StreamingLinkResult,
} from '../src/api/cloudflare/streamingLinkService';
import { groupSubscriptionProviders } from '../src/movie/streaming/groupSubscriptionProviders';
import { MovieDetailInfoSections } from '../src/movie/components/MovieDetailInfoSections';
import { ScrollFriendlyTapTarget } from '../src/shared/ScrollFriendlyTapTarget';
import { useMovieWatchProvidersQuery } from '../src/hooks/useMovieSearchQuery';
import type { movieType } from '../src/types/movie/MovieTypes';

jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));
jest.mock('../src/hooks/useMovieSearchQuery', () => ({
  useMovieWatchProvidersQuery: jest.fn(),
}));
const provider = (provider_id: number, provider_name = 'Source name') => ({
  provider_id,
  provider_name,
  logo_path: null,
});
const originalFetch = globalThis.fetch;
let tree: TestRenderer.ReactTestRenderer | undefined;
afterEach(() => {
  if (tree) act(() => tree!.unmount());
  tree = undefined;
  globalThis.fetch = originalFetch;
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('groups all supplied routes, deduplicating IDs without merging equal service names', () => {
  const input = [
    provider(1794),
    provider(528),
    provider(526),
    provider(43),
    provider(1854),
    provider(528),
    provider(635),
  ];
  const grouped = groupSubscriptionProviders(input);
  expect(
    grouped.map(g => [g.key, g.providers.map(p => p.provider_id)]),
  ).toEqual([
    ['direct', [526, 43]],
    ['prime_video_channels', [528, 1794]],
    ['apple_tv_channels', [1854]],
    ['roku_channels', [635]],
  ]);
  expect(grouped[0].providers[0].route.displayServiceName).toBe('AMC+');
  expect(grouped[1].providers[0].route).toMatchObject({
    tmdbProviderId: 528,
    displayServiceName: 'AMC+',
    playbackPlatform: 'prime',
  });
  expect(input).toHaveLength(7);
  expect(groupSubscriptionProviders([])).toEqual([]);
});

test.each([
  [526, 'direct'],
  [528, 'prime_video_channels'],
])('only renders the available AMC+ route %s', (id, category) => {
  const groups = groupSubscriptionProviders([provider(Number(id))]);
  expect(groups).toHaveLength(1);
  expect(groups[0].key).toBe(category);
  expect(groups[0].providers.map(p => p.provider_id)).toEqual([id]);
});

test('does not turn simultaneous standalone Hulu and Disney availability into a bundle', () => {
  expect(
    groupSubscriptionProviders([provider(15), provider(337)]).map(g => g.key),
  ).toEqual(['direct']);
  expect(
    routes.subscriptionRoutes.some(r => r.providerKey === 'hulu_disney_plus'),
  ).toBe(false);
  const explicit = {
    ...routes.huluDisneyRouteTemplate,
    tmdbProviderId: 999001,
  };
  const groups = groupSubscriptionProviders(
    [provider(15), provider(999001)],
    [...routes.subscriptionRoutes, explicit],
  );
  expect(groups.map(g => g.key)).toEqual(['direct', 'disney_plus']);
  expect(groups[1].providers[0].route.playbackPlatform).toBe('disney');
});

test('preserves unmapped TMDB routes without enabling an unverified destination', () => {
  const group = groupSubscriptionProviders([
    provider(999002, 'New Service Amazon Channel'),
  ])[0];
  expect(group.key).toBe('prime_video_channels');
  expect(group.providers[0].route).toMatchObject({
    tmdbProviderId: 999002,
    displayServiceName: 'New Service',
    playbackPlatform: null,
  });
});

function resolved(
  providerId: number,
  webUrl: string,
): Extract<StreamingLinkResult, { resolved: true }> {
  const route = routes.subscriptionRouteForProviderId(providerId)!;
  const destination = destinationForRouteFromUrl(route, webUrl)!;
  return {
    tmdbId: 938614,
    providerId,
    region: 'US',
    resolved: true,
    provider: route.playbackPlatform!,
    providerKey: route.providerKey,
    displayServiceName: route.displayServiceName,
    subscriptionCategory: route.subscriptionCategory,
    playbackPlatform: route.playbackPlatform,
    source: 'streaming-availability',
    cacheHit: true,
    ...destination,
  };
}

test('rejects a channel result redirected to standalone AMC+ or the wrong Apple offer', () => {
  const prime = resolved(
    528,
    'https://www.primevideo.com/detail/0NYJVVVAGM57ZC561VK0R657IV',
  );
  expect(isSafeStreamingDestination(prime)).toBe(true);
  expect(isSafeStreamingDestination({ ...prime, providerId: 526 })).toBe(false);
  expect(
    isSafeStreamingDestination({ ...prime, playbackPlatform: 'amc' }),
  ).toBe(false);
  expect(isSafeStreamingDestination({ ...prime, providerKey: undefined })).toBe(
    false,
  );
  const apple = resolved(
    1854,
    'https://tv.apple.com/us/movie/late-night-with-the-devil/umc.cmc.prb0czsivjhyev6dcwdwesde?playableId=tvs.sbd.1000383%3AAMCNFL0000013474',
  );
  expect(isSafeStreamingDestination(apple)).toBe(true);
  if (!apple.resolved) throw new Error('Expected resolved fixture');
  expect(
    isSafeStreamingDestination({
      ...apple,
      webUrl: apple.webUrl.replace('1000383', '9001'),
    }),
  ).toBe(false);
});

test.each([
  [
    526,
    'AMC+',
    'https://www.amcplus.com/movies/late-night-with-the-devil--1067652',
  ],
  [
    528,
    'AMC+ through Prime Video Channels',
    'https://www.primevideo.com/detail/0NYJVVVAGM57ZC561VK0R657IV',
  ],
  [43, 'STARZ', 'https://www.starz.com/us/en/movies/michael-67321'],
  [
    1794,
    'STARZ through Prime Video Channels',
    'https://www.primevideo.com/detail/B012345678',
  ],
  [
    1854,
    'AMC+ through Apple TV Channels',
    'https://tv.apple.com/us/movie/late-night-with-the-devil/umc.cmc.prb0czsivjhyev6dcwdwesde?playableId=tvs.sbd.1000383%3AAMCNFL0000013474',
  ],
  [
    999001,
    'Hulu through Disney+',
    'https://www.disneyplus.com/browse/entity-a5c3c6e5-da1c-40ec-b708-4c7987689657',
  ],
])(
  'a tap on route %s opens its platform, with immediate feedback and unchanged rental rows',
  async (providerId, label, url) => {
    const id = Number(providerId);
    if (id === 999001) {
      const actual = routes.subscriptionRouteForProviderId;
      jest
        .spyOn(routes, 'subscriptionRouteForProviderId')
        .mockImplementation((candidate, catalog) =>
          candidate === id
            ? { ...routes.huluDisneyRouteTemplate, tmdbProviderId: id }
            : actual(candidate, catalog),
        );
    }
    (useMovieWatchProvidersQuery as jest.Mock).mockReturnValue({
      data: {
        results: {
          US: {
            flatrate: [provider(526), provider(528), provider(id)],
            rent: [provider(id, 'Original rental name')],
          },
        },
      },
      isError: false,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });
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
    const target = tree!.root
      .findAllByType(ScrollFriendlyTapTarget)
      .find(row => row.props.accessibilityLabel === `Open movie on ${label}`)!;
    expect(target).toBeDefined();
    expect(
      tree!.root
        .findAllByType(Text)
        .some(t => t.props.children === 'Original rental name'),
    ).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    act(() => target.props.onPress());
    expect(target.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(
      target
        .findAllByType(Text)
        .some(t => t.props.children === 'Watch Movie Now'),
    ).toBe(false);
    expect(open).not.toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`providerId=${id}&region=US`),
      expect.anything(),
    );
    await act(async () =>
      finish({ ok: true, json: async () => resolved(id, String(url)) }),
    );
    expect(open).toHaveBeenLastCalledWith(String(url));
    expect(target.findAllByType(ActivityIndicator)).toHaveLength(0);
  },
);
