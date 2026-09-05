import { Linking } from 'react-native';
import {
  adapterForRoute,
  destinationFromUrl,
  type StreamingProvider,
} from '../src/api/cloudflare/streamingProviderCatalog';
import {
  isSafeStreamingDestination,
  type StreamingLinkResult,
} from '../src/api/cloudflare/streamingLinkService';
import type { SubscriptionRoute } from '../src/api/cloudflare/subscriptionRoutes';
import { launchStreamingProvider } from '../src/movie/streaming/launchStreamingProvider';

const samples: [number, StreamingProvider, string][] = [
  [8, 'netflix', 'https://www.netflix.com/title/80223779'],
  [
    15,
    'hulu',
    'https://www.hulu.com/movie/marvel-studios%27-the-avengers-d2ab699b-67da-4906-a7a4-5bc542c953cf',
  ],
  [
    9,
    'prime',
    'https://app.primevideo.com/detail?gti=amzn1.dv.gti.414eb1af-ee27-476c-bc46-bedd48595f59',
  ],
  [
    1899,
    'max',
    'https://play.hbomax.com/movie/52217243-a137-45d6-9c6a-0dfab4633034',
  ],
  [
    337,
    'disney',
    'https://www.disneyplus.com/browse/entity-f6174ebf-cb92-453c-a52b-62bb3576e402',
  ],
  [
    350,
    'apple',
    'https://tv.apple.com/us/movie/f1-the-movie/umc.cmc.3t6dvnnr87zwd4wmvpdx5came',
  ],
  [
    387,
    'peacock',
    'https://www.peacocktv.com/watch/asset/movies/insidious/4e51408e-3b18-3583-8ea3-7f0790250456',
  ],
  [
    526,
    'amc',
    'https://www.amcplus.com/movies/late-night-with-the-devil--1067652',
  ],
  [
    531,
    'paramount',
    'https://www.paramountplus.com/movies/video/Alcn0hcGx0HosdhcawKteH8DXh3RiOF7/',
  ],
];

afterEach(() => jest.restoreAllMocks());

function route(
  tmdbProviderId: number,
  playbackPlatform: string,
): SubscriptionRoute {
  return {
    tmdbProviderId,
    providerName: playbackPlatform,
    providerKey: `tmdb_${tmdbProviderId}`,
    displayServiceName: playbackPlatform,
    subscriptionCategory: 'direct',
    playbackPlatform,
    officialHomepageUrl: `https://${playbackPlatform}.example/`,
    launchAvailable: true,
  };
}

test.each(samples)(
  'launches the validated exact page for provider %s (%s)',
  async (providerId, provider, url) => {
    const expectedRoute = route(providerId, provider);
    expect(adapterForRoute(expectedRoute)?.provider).toBe(provider);
    const parsed = destinationFromUrl(provider, url)!;
    const result: StreamingLinkResult = {
      tmdbId: 1,
      providerId,
      region: 'US',
      monetizationType: 'flatrate',
      resolved: true,
      destinationType: 'exact',
      provider,
      providerKey: expectedRoute.providerKey,
      displayServiceName: expectedRoute.displayServiceName,
      subscriptionCategory: expectedRoute.subscriptionCategory,
      playbackPlatform: expectedRoute.playbackPlatform,
      source: 'streaming-availability',
      cacheHit: false,
      ...parsed,
    };
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    expect(isSafeStreamingDestination(result, expectedRoute)).toBe(true);
    await launchStreamingProvider(result, expectedRoute);
    expect(open).toHaveBeenLastCalledWith(parsed.nativeUrl ?? parsed.webUrl);
    expect(
      isSafeStreamingDestination({ ...result, providerId: 999999 }, expectedRoute),
    ).toBe(false);
    expect(
      isSafeStreamingDestination(
        { ...result, providerContentId: 'wrong-movie' },
        expectedRoute,
      ),
    ).toBe(false);
    expect(
      isSafeStreamingDestination(
        { ...result, webUrl: 'https://evil.example/movie' },
        expectedRoute,
      ),
    ).toBe(false);
  },
);
