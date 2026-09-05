import React from 'react';
import { Linking } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { useIsFocused } from '@react-navigation/native';
import {
  fetchStreamingLink,
  type StreamingLinkResult,
} from '../src/api/cloudflare/streamingLinkService';
import type { SubscriptionRoute } from '../src/api/cloudflare/subscriptionRoutes';
import { launchStreamingProvider } from '../src/movie/streaming/launchStreamingProvider';
import { useStreamingProviderLaunch } from '../src/movie/streaming/useStreamingProviderLaunch';

jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn(() => true),
}));

const netflixRoute: SubscriptionRoute = {
  tmdbProviderId: 8,
  providerName: 'Netflix',
  providerKey: 'tmdb_8',
  displayServiceName: 'Netflix',
  subscriptionCategory: 'direct',
  playbackPlatform: 'netflix',
  officialHomepageUrl: 'https://www.netflix.com/',
  launchAvailable: true,
};
const request = {
  tmdbId: 492188,
  providerId: 8,
  region: 'US',
  monetizationType: 'flatrate' as const,
};
const destination: StreamingLinkResult = {
  ...request,
  resolved: true,
  destinationType: 'exact',
  provider: 'netflix',
  providerKey: netflixRoute.providerKey,
  displayServiceName: netflixRoute.displayServiceName,
  subscriptionCategory: netflixRoute.subscriptionCategory,
  playbackPlatform: netflixRoute.playbackPlatform,
  providerContentId: '80223779',
  nativeUrl: 'nflx://www.netflix.com/watch/80223779',
  webUrl: 'https://www.netflix.com/title/80223779',
  source: 'wikidata',
  cacheHit: true,
};
const response = (body: unknown) => ({ ok: true, json: async () => body });
const originalFetch = globalThis.fetch;
let trees: TestRenderer.ReactTestRenderer[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  (useIsFocused as jest.Mock).mockReturnValue(true);
});

afterEach(() => {
  act(() => trees.forEach(tree => tree.unmount()));
  trees = [];
  globalThis.fetch = originalFetch;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('streaming resolver client', () => {
  test('sends the exact selected offer identity to the Worker', async () => {
    const fetchSpy = jest.fn().mockResolvedValue(response(destination));
    globalThis.fetch = fetchSpy;
    await expect(fetchStreamingLink(request, netflixRoute)).resolves.toEqual(
      destination,
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://movieapp-cloudflare.carlo-roncallo.workers.dev/streaming-link?tmdbId=492188&providerId=8&region=US&monetizationType=flatrate',
      { signal: expect.anything() },
    );
  });

  test.each([
    { tmdbId: 123 },
    { providerId: 15 },
    { region: 'CA' },
    { monetizationType: 'rent' },
    { providerKey: 'tmdb_15' },
    { webUrl: 'https://netflix.com.evil.example/title/80223779' },
    { providerContentId: '../80223779' },
  ])('rejects a mismatched or unsafe response: %o', async change => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(response({ ...destination, ...change }));
    await expect(fetchStreamingLink(request, netflixRoute)).rejects.toThrow();
  });

  test('accepts only the official homepage supplied by the expected D1 route', async () => {
    const result: StreamingLinkResult = {
      ...request,
      resolved: true,
      destinationType: 'provider_homepage',
      provider: 'netflix',
      providerKey: netflixRoute.providerKey,
      displayServiceName: netflixRoute.displayServiceName,
      subscriptionCategory: netflixRoute.subscriptionCategory,
      playbackPlatform: netflixRoute.playbackPlatform,
      providerContentId: null,
      nativeUrl: null,
      webUrl: netflixRoute.officialHomepageUrl!,
      source: 'provider-homepage',
      cacheHit: false,
      fallbackReason: 'no_match',
    };
    globalThis.fetch = jest.fn().mockResolvedValue(response(result));
    await expect(fetchStreamingLink(request, netflixRoute)).resolves.toEqual(
      result,
    );
    globalThis.fetch = jest.fn().mockResolvedValue(
      response({ ...result, webUrl: 'https://unrelated.example/' }),
    );
    await expect(fetchStreamingLink(request, netflixRoute)).rejects.toThrow();
  });

  test('aborts the network request after its timeout', async () => {
    jest.useFakeTimers();
    globalThis.fetch = jest.fn(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new Error('Aborted')),
          );
        }),
    );
    const pending = fetchStreamingLink(request, netflixRoute);
    jest.advanceTimersByTime(20000);
    await expect(pending).rejects.toThrow('Aborted');
  });
});

describe('provider launch', () => {
  test('tries the exact native title, then the exact web title', async () => {
    const open = jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('App missing'))
      .mockResolvedValueOnce(undefined);
    await expect(
      launchStreamingProvider(destination, netflixRoute),
    ).resolves.toBe('web');
    expect(open.mock.calls).toEqual([
      ['nflx://www.netflix.com/watch/80223779'],
      ['https://www.netflix.com/title/80223779'],
    ]);
  });

  test('does not open an exact result after navigation cancels it', async () => {
    const controller = new AbortController();
    controller.abort();
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await expect(
      launchStreamingProvider(destination, netflixRoute, controller.signal),
    ).rejects.toThrow('cancelled');
    expect(open).not.toHaveBeenCalled();
  });
});

function mountHook() {
  let controls!: ReturnType<typeof useStreamingProviderLaunch>;
  function Harness() {
    controls = useStreamingProviderLaunch(492188, 'US');
    return null;
  }
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<Harness />);
  });
  trees.push(tree);
  return {
    getControls: () => controls,
    tree,
    rerender: () => tree.update(<Harness />),
  };
}

describe('provider tap lifecycle', () => {
  test('coalesces rapid taps and exposes immediate loading state', async () => {
    let finish!: (value: unknown) => void;
    globalThis.fetch = jest.fn(
      () =>
        new Promise<unknown>(resolve => {
          finish = resolve;
        }),
    ) as typeof fetch;
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const hook = mountHook();
    let pending!: Promise<void>;
    act(() => {
      pending = hook
        .getControls()
        .openProvider(8, 'flatrate', netflixRoute);
      void hook.getControls().openProvider(8, 'flatrate', netflixRoute);
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(hook.getControls().openingProviderId).toBe(8);
    await act(async () => {
      finish(response(destination));
      await pending;
    });
    expect(open).toHaveBeenCalledTimes(1);
    expect(hook.getControls().openingProviderId).toBeNull();
  });

  test('does not launch a response that arrives after the screen loses focus', async () => {
    let finish!: (value: unknown) => void;
    globalThis.fetch = jest.fn(
      () =>
        new Promise<unknown>(resolve => {
          finish = resolve;
        }),
    ) as typeof fetch;
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const hook = mountHook();
    let pending!: Promise<void>;
    act(() => {
      pending = hook
        .getControls()
        .openProvider(8, 'flatrate', netflixRoute);
    });
    act(() => {
      (useIsFocused as jest.Mock).mockReturnValue(false);
      hook.rerender();
    });
    await act(async () => {
      finish(response(destination));
      await pending;
    });
    expect(open).not.toHaveBeenCalled();
  });

  test('opens a Worker-returned provider homepage', async () => {
    const homepage: StreamingLinkResult = {
      ...request,
      resolved: true,
      destinationType: 'provider_homepage',
      provider: 'netflix',
      providerKey: netflixRoute.providerKey,
      displayServiceName: netflixRoute.displayServiceName,
      subscriptionCategory: netflixRoute.subscriptionCategory,
      playbackPlatform: netflixRoute.playbackPlatform,
      providerContentId: null,
      nativeUrl: null,
      webUrl: netflixRoute.officialHomepageUrl!,
      source: 'provider-homepage',
      cacheHit: false,
      fallbackReason: 'no_match',
    };
    globalThis.fetch = jest.fn().mockResolvedValue(response(homepage));
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const hook = mountHook();
    await act(async () => {
      await hook.getControls().openProvider(8, 'flatrate', netflixRoute);
    });
    expect(open).toHaveBeenCalledWith('https://www.netflix.com/');
  });
});
