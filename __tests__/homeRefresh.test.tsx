import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { HomeScreen } from '../src/home/HomeScreen';
import {
  useHomeGenreMoviesQuery,
  usePopularMoviesQuery,
  useStreamingMoviesQuery,
  useUpcomingMoviesQuery,
} from '../src/hooks/useMovieSearchQuery';
import { prepareMovieImageUris } from '../src/utils/movieImageLoading';
import type { movieType } from '../src/types/movie/MovieTypes';

jest.mock('@react-navigation/native', () => ({
  DrawerActions: { openDrawer: jest.fn() },
  useIsFocused: () => true,
  useNavigation: () => ({ dispatch: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('../src/hooks/useDetailNavigation', () => ({
  useDetailNavigation: () => ({ openMovieDetail: jest.fn() }),
}));

jest.mock('../src/hooks/useMovieSearchQuery', () => ({
  useHomeGenreMoviesQuery: jest.fn(),
  usePopularMoviesQuery: jest.fn(),
  useStreamingMoviesQuery: jest.fn(),
  useUpcomingMoviesQuery: jest.fn(),
}));

jest.mock('../src/utils/movieImageLoading', () => ({
  prepareMovieImageUris: jest.fn(() =>
    Promise.resolve({
      requestedCount: 0,
      prefetchCount: 0,
      failedUris: [],
      timedOut: false,
    }),
  ),
}));

jest.mock('../src/shared/refresh/usePageRefresh', () => ({
  usePageRefresh: (refreshPage: () => Promise<unknown>) => ({
    onRefresh: refreshPage,
    refreshing: false,
  }),
}));

jest.mock('../src/shared/refresh/RefreshableScrollView', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    RefreshableScrollView: ({ children, onRefresh }: any) =>
      MockReact.createElement(
        MockView,
        { testID: 'home-scroll', onRefresh },
        children,
      ),
  };
});

jest.mock('../src/home/HomeHeroCarousel', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    HomeHeroCarousel: (props: any) =>
      MockReact.createElement(MockView, { ...props, testID: 'home-hero' }),
  };
});

jest.mock('../src/home/HomeMoviePosterRow', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    HomeMoviePosterRow: (props: any) =>
      MockReact.createElement(MockView, {
        ...props,
        testID: `home-row-${props.title}`,
      }),
  };
});

jest.mock('../src/shared/header/HeaderActionRow', () => ({
  HeaderActionRow: () => null,
}));

jest.mock('../src/shared/header/HeaderNavButton', () => ({
  HeaderNavButton: () => null,
}));

type QueryResult = {
  data: movieType[];
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  refetch: jest.Mock<Promise<QueryResult>, []>;
};

function movie(id: number) {
  return {
    id,
    title: `Movie ${id}`,
    poster_path: `/movie-${id}.jpg`,
  } as movieType;
}

function preparationResult(failedUris: string[] = []) {
  return {
    requestedCount: 1,
    prefetchCount: 1,
    failedUris,
    timedOut: false,
  };
}

function createQueryResult(id: number) {
  let resolveRefresh!: (result: QueryResult) => void;
  const refreshedResult = {} as QueryResult;
  const refreshPromise = new Promise<QueryResult>(resolve => {
    resolveRefresh = resolve;
  });
  const result: QueryResult = {
    data: [movie(id)],
    error: null,
    isError: false,
    isLoading: false,
    refetch: jest.fn(() => refreshPromise),
  };

  Object.assign(refreshedResult, {
    ...result,
    data: [movie(id + 100)],
  });

  return {
    result,
    resolveRefresh: () => resolveRefresh(refreshedResult),
  };
}

function configureHomeQueries(queries: Array<{ result: QueryResult }>) {
  jest
    .mocked(useUpcomingMoviesQuery)
    .mockReturnValue(queries[0].result as any);
  jest
    .mocked(usePopularMoviesQuery)
    .mockReturnValue(queries[1].result as any);
  jest
    .mocked(useStreamingMoviesQuery)
    .mockReturnValue(queries[2].result as any);
  jest
    .mocked(useHomeGenreMoviesQuery)
    .mockImplementation((_rowKey, genreId) => {
      const genreIds = [10751, 35, 18, 80, 27, 10402, 99];
      return queries[genreIds.indexOf(genreId) + 3].result as any;
    });
}

function countRenderedViews(
  component: TestRenderer.ReactTestRenderer,
  testID: string,
) {
  return component.root
    .findAllByType(View)
    .filter(node => node.props.testID === testID).length;
}

describe('Home pull-to-refresh', () => {
  beforeEach(() => {
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback: (timestamp: number) => void) => {
        callback(0);
        return 1;
      });
    jest.mocked(prepareMovieImageUris).mockReset();
    jest
      .mocked(prepareMovieImageUris)
      .mockResolvedValue(preparationResult() as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('finishes hero and Popular before starting the offscreen rows', async () => {
    const frameCallbacks: Array<(timestamp: number) => void> = [];
    jest
      .mocked(requestAnimationFrame)
      .mockImplementation(callback => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      });
    const queries = Array.from({ length: 10 }, (_, index) =>
      createQueryResult(index + 1),
    );
    queries[2].result.isLoading = true;
    queries[2].result.data = [];
    configureHomeQueries(queries);
    const preparationResolvers = new Map<
      number,
      (result: ReturnType<typeof preparationResult>) => void
    >();

    jest.mocked(prepareMovieImageUris).mockImplementation(imageUris => {
      const movieIdMatch = imageUris[0]?.match(/movie-(\d+)\.jpg$/);
      const movieId = movieIdMatch ? Number(movieIdMatch[1]) : undefined;

      return new Promise(resolve => {
        if (movieId !== undefined) {
          preparationResolvers.set(movieId, resolve);
        }
      });
    });

    let component!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      component = TestRenderer.create(<HomeScreen />);
      await Promise.resolve();
    });

    expect(prepareMovieImageUris).toHaveBeenCalledTimes(2);
    expect(countRenderedViews(component, 'home-hero')).toBe(1);
    expect(component.root.findByProps({ testID: 'home-hero' }).props.isLoading)
      .toBe(true);
    expect(countRenderedViews(component, 'home-row-Popular Movies')).toBe(1);
    expect(
      component.root.findByProps({ testID: 'home-row-Popular Movies' }).props
        .isLoading,
    ).toBe(true);
    expect(countRenderedViews(component, 'home-row-Streaming Now')).toBe(0);
    expect(countRenderedViews(component, 'home-row-Family Movies')).toBe(0);

    await act(async () => {
      preparationResolvers.get(2)?.(
        preparationResult([
          'https://image.tmdb.org/t/p/w342/movie-2.jpg',
        ]),
      );
      await Promise.resolve();
    });

    expect(
      component.root.findByProps({ testID: 'home-row-Popular Movies' }).props
        .isLoading,
    ).toBe(true);
    expect(prepareMovieImageUris).toHaveBeenCalledTimes(2);
    expect(countRenderedViews(component, 'home-row-Streaming Now')).toBe(0);

    await act(async () => {
      preparationResolvers.get(1)?.(preparationResult());
      await Promise.resolve();
    });

    expect(component.root.findByProps({ testID: 'home-hero' }).props.isLoading)
      .toBe(false);
    expect(
      component.root.findByProps({ testID: 'home-row-Popular Movies' }).props
        .isLoading,
    ).toBe(false);
    expect(
      component.root
        .findByProps({ testID: 'home-row-Popular Movies' })
        .props.unavailableImageUris.has(
          'https://image.tmdb.org/t/p/w342/movie-2.jpg',
        ),
    ).toBe(true);
    expect(prepareMovieImageUris).toHaveBeenCalledTimes(2);
    expect(countRenderedViews(component, 'home-row-Streaming Now')).toBe(0);

    await act(async () => {
      frameCallbacks.shift()?.(0);
      await Promise.resolve();
    });

    expect(prepareMovieImageUris).toHaveBeenCalledTimes(2);
    expect(countRenderedViews(component, 'home-row-Streaming Now')).toBe(0);

    await act(async () => {
      frameCallbacks.shift()?.(0);
      await Promise.resolve();
    });

    expect(prepareMovieImageUris).toHaveBeenCalledTimes(9);
    expect(countRenderedViews(component, 'home-row-Streaming Now')).toBe(1);
    expect(
      component.root.findByProps({ testID: 'home-row-Streaming Now' }).props
        .isLoading,
    ).toBe(true);
    expect(
      component.root.findByProps({ testID: 'home-row-Family Movies' }).props
        .isLoading,
    ).toBe(true);

    await act(async () => {
      preparationResolvers.forEach((resolve, movieId) => {
        if (movieId !== 1 && movieId !== 2) {
          resolve(preparationResult());
        }
      });
      await Promise.resolve();
    });

    act(() => component.unmount());
  });

  test('clears the entire page before rebuilding all Home collections', async () => {
    const queries = Array.from({ length: 10 }, (_, index) =>
      createQueryResult(index + 1),
    );
    configureHomeQueries(queries);

    let component!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      component = TestRenderer.create(<HomeScreen />);
      await Promise.resolve();
    });

    expect(prepareMovieImageUris).toHaveBeenCalledTimes(10);
    expect(countRenderedViews(component, 'home-hero')).toBe(1);
    expect(
      component.root
        .findAllByType(View)
        .filter(node => String(node.props.testID).startsWith('home-row-')),
    ).toHaveLength(9);

    const refresh = component.root.findByProps({ testID: 'home-scroll' }).props
      .onRefresh as () => Promise<void>;
    let refreshPromise!: Promise<void>;

    await act(async () => {
      refreshPromise = refresh();
      await Promise.resolve();
    });

    expect(
      queries.every(query => query.result.refetch.mock.calls.length === 1),
    ).toBe(true);
    expect(countRenderedViews(component, 'home-hero')).toBe(0);
    expect(
      component.root
        .findAllByType(View)
        .filter(node => String(node.props.testID).startsWith('home-row-')),
    ).toHaveLength(0);
    expect(component.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(component.root.findAllByType(Text)).toHaveLength(0);

    await act(async () => {
      queries.forEach(query => query.resolveRefresh());
      await refreshPromise;
      await Promise.resolve();
    });

    expect(prepareMovieImageUris).toHaveBeenCalledTimes(20);
    expect(countRenderedViews(component, 'home-hero')).toBe(1);
    expect(
      component.root
        .findAllByType(View)
        .filter(node => String(node.props.testID).startsWith('home-row-')),
    ).toHaveLength(9);

    act(() => component.unmount());
  });
});
