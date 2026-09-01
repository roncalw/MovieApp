import React from 'react';
import { ActivityIndicator, Linking, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { useIsFocused } from '@react-navigation/native';
import {
  fetchStreamingLink,
  isSafeStreamingDestination,
  type StreamingLinkResult,
} from '../src/api/cloudflare/streamingLinkService';
import { launchStreamingProvider } from '../src/movie/streaming/launchStreamingProvider';
import { useStreamingProviderLaunch } from '../src/movie/streaming/useStreamingProviderLaunch';
import { MovieDetailInfoSections } from '../src/movie/components/MovieDetailInfoSections';
import { ScrollFriendlyTapTarget } from '../src/shared/ScrollFriendlyTapTarget';
import { useMovieWatchProvidersQuery } from '../src/hooks/useMovieSearchQuery';
import type { movieType } from '../src/types/movie/MovieTypes';

jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn(() => true),
}));
jest.mock('../src/hooks/useMovieSearchQuery', () => ({
  useMovieWatchProvidersQuery: jest.fn(),
}));

const request = { tmdbId: 492188, providerId: 8, region: 'US' };
const destination: StreamingLinkResult = {
  ...request,
  resolved: true,
  provider: 'netflix',
  providerContentId: '80223779',
  nativeUrl: 'nflx://www.netflix.com/watch/80223779',
  webUrl: 'https://www.netflix.com/title/80223779',
  source: 'wikidata',
  cacheHit: true,
};
const originalFetch = globalThis.fetch;
const response = (body: unknown) => ({ ok: true, json: async () => body });
let trees: TestRenderer.ReactTestRenderer[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  (Linking.openURL as jest.Mock).mockReset();
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
  test('sends only the selected movie, TMDB provider and region to the Worker', async () => {
    const fetchSpy = jest.fn().mockResolvedValue(response(destination));
    globalThis.fetch = fetchSpy;
    await expect(fetchStreamingLink(request)).resolves.toEqual(destination);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://movieapp-cloudflare.carlo-roncallo.workers.dev/streaming-link?tmdbId=492188&providerId=8&region=US',
      { signal: expect.anything() },
    );
  });

  test.each([
    { tmdbId: 123 },
    { providerId: 15 },
    { region: 'CA' },
    { webUrl: 'https://www.netflix.com/title/80000001' },
    { webUrl: 'https://netflix.com.evil.example/title/80223779' },
    { nativeUrl: 'nflx://www.netflix.com/watch/80000001' },
    { nativeUrl: 'file:///private/example' },
    { providerContentId: '../80223779' },
  ])('rejects mismatched or unsafe responses: %o', async change => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(response({ ...destination, ...change }));
    await expect(fetchStreamingLink(request)).rejects.toThrow();
  });

  test('keeps an unresolved result controlled and rejects HTTP failures', async () => {
    const miss = {
      ...request,
      resolved: false,
      provider: 'netflix',
      reason: 'no_match',
    };
    globalThis.fetch = jest.fn().mockResolvedValue(response(miss));
    await expect(fetchStreamingLink(request)).resolves.toEqual(miss);
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchStreamingLink(request)).rejects.toThrow();
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
    const pending = fetchStreamingLink(request);
    jest.advanceTimersByTime(20000);
    await expect(pending).rejects.toThrow('Aborted');
  });
});

describe('provider launch', () => {
  test('does not open the browser if navigation cancels a failed native attempt', async () => {
    const controller = new AbortController();
    const open = jest.spyOn(Linking, 'openURL').mockImplementation(async () => {
      controller.abort();
      throw new Error('App missing');
    });
    await expect(
      launchStreamingProvider(destination, controller.signal),
    ).rejects.toThrow('cancelled');
    expect(open).toHaveBeenCalledTimes(1);
  });
  test('tries the exact Netflix native title first', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await expect(launchStreamingProvider(destination)).resolves.toBe('native');
    expect(open.mock.calls).toEqual([
      ['nflx://www.netflix.com/watch/80223779'],
    ]);
  });

  test('opens the same title on the web when Netflix is not installed', async () => {
    const open = jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('App missing'))
      .mockResolvedValueOnce(undefined);
    await expect(launchStreamingProvider(destination)).resolves.toBe('web');
    expect(open.mock.calls).toEqual([
      ['nflx://www.netflix.com/watch/80223779'],
      ['https://www.netflix.com/title/80223779'],
    ]);
  });

  test('supports a web-only destination and reports when neither launch succeeds', async () => {
    const open = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValueOnce(undefined)
      .mockRejectedValue(new Error('Unavailable'));
    await expect(
      launchStreamingProvider({ ...destination, nativeUrl: null }),
    ).resolves.toBe('web');
    await expect(launchStreamingProvider(destination)).rejects.toThrow();
    expect(open).toHaveBeenCalledTimes(3);
  });

  test('never launches an unsafe or unresolved URL', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const unsafe = { ...destination, webUrl: 'https://evil.example' };
    expect(isSafeStreamingDestination(unsafe)).toBe(false);
    await expect(launchStreamingProvider(unsafe)).rejects.toThrow();
    await expect(
      launchStreamingProvider({
        ...request,
        resolved: false,
        provider: 'netflix',
        reason: 'no_match',
      }),
    ).rejects.toThrow();
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
  test('does not resolve on render and coalesces rapid taps into one request', async () => {
    let finish!: (value: unknown) => void;
    const fetchSpy = jest.fn(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    globalThis.fetch = fetchSpy as typeof fetch;
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const hook = mountHook();
    expect(fetchSpy).not.toHaveBeenCalled();
    let pending!: Promise<void>;
    act(() => {
      pending = hook.getControls().openProvider(8);
      void hook.getControls().openProvider(8);
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(hook.getControls().openingProviderId).toBe(8);
    await act(async () => {
      finish(response(destination));
      await pending;
    });
    expect(open).toHaveBeenCalledTimes(1);
    expect(hook.getControls().openingProviderId).toBeNull();
  });

  test.each(['blur', 'unmount'])(
    'does not launch a late response after %s',
    async action => {
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
        pending = hook.getControls().openProvider(8);
      });
      act(() => {
        if (action === 'blur') {
          (useIsFocused as jest.Mock).mockReturnValue(false);
          hook.rerender();
        } else hook.tree.unmount();
      });
      await act(async () => {
        finish(response(destination));
        await pending;
      });
      expect(open).not.toHaveBeenCalled();
    },
  );

  test('shows a useful miss message and leaves the row ready for another tap', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      response({
        ...request,
        resolved: false,
        provider: 'netflix',
        reason: 'no_match',
      }),
    );
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const hook = mountHook();
    await act(async () => {
      await hook.getControls().openProvider(8);
    });
    expect(hook.getControls().message).toContain(
      'not available for this movie',
    );
    expect(hook.getControls().openingProviderId).toBeNull();
    expect(open).not.toHaveBeenCalled();
  });

  test('keeps TMDB availability and existing categories unchanged, enabling supported subscription rows only', async () => {
    const netflix = {
      provider_id: 8,
      provider_name: 'Netflix',
      logo_path: null,
    };
    (useMovieWatchProvidersQuery as jest.Mock).mockReturnValue({
      data: {
        results: {
          US: {
            flatrate: [
              netflix,
              { provider_id: 15, provider_name: 'Hulu', logo_path: null },
            ],
            rent: [netflix],
          },
        },
      },
      isError: false,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });
    let finishLookup!: (value: unknown) => void;
    globalThis.fetch = jest.fn(
      () =>
        new Promise<unknown>(resolve => {
          finishLookup = resolve;
        }),
    ) as typeof fetch;
    const open = jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('No app'))
      .mockResolvedValue(undefined);
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MovieDetailInfoSections movieId={492188} movie={{} as movieType} />,
      );
    });
    trees.push(tree);
    const targets = tree.root
      .findAllByType(ScrollFriendlyTapTarget)
      .filter(target => target.props.accessibilityRole === 'link');
    expect(targets).toHaveLength(2);
    const netflixTarget = targets.find(
      target => target.props.accessibilityLabel === 'Open movie on Netflix',
    )!;
    expect(netflixTarget).toBeDefined();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    const watchLabels = () =>
      tree.root
        .findAllByType(Text)
        .filter(text => text.props.children === 'Watch Movie Now');
    expect(watchLabels()).toHaveLength(2);
    act(() => {
      netflixTarget.props.onPress();
    });
    // Hold the server response to verify feedback appears while the lookup is
    // still pending, before either the provider app or browser can open.
    expect(watchLabels()).toHaveLength(1);
    expect(netflixTarget.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(netflixTarget.props.accessibilityState).toEqual({ busy: true });
    expect(targets.every(target => target.props.disabled)).toBe(true);
    expect(open).not.toHaveBeenCalled();
    await act(async () => {
      finishLookup(response(destination));
    });
    expect(watchLabels()).toHaveLength(2);
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(open.mock.calls).toEqual([
      ['nflx://www.netflix.com/watch/80223779'],
      ['https://www.netflix.com/title/80223779'],
    ]);
  });
});
