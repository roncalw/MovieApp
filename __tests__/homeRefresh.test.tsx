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
import { prepareMovieImages } from '../src/utils/movieImageLoading';
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
  prepareMovieImages: jest.fn(() => Promise.resolve()),
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
    HomeHeroCarousel: () =>
      MockReact.createElement(MockView, { testID: 'home-hero' }),
  };
});

jest.mock('../src/home/HomeMoviePosterRow', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    HomeMoviePosterRow: () =>
      MockReact.createElement(MockView, { testID: 'home-row' }),
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
  error: null;
  isError: false;
  isLoading: false;
  refetch: jest.Mock<Promise<QueryResult>, []>;
};

function movie(id: number) {
  return { id, title: `Movie ${id}` } as movieType;
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

function countRenderedViews(
  component: TestRenderer.ReactTestRenderer,
  testID: string,
) {
  return component.root
    .findAllByType(View)
    .filter(node => node.props.testID === testID).length;
}

describe('Home pull-to-refresh', () => {
  test('clears the entire page before rebuilding all Home collections', async () => {
    const queries = Array.from({ length: 10 }, (_, index) =>
      createQueryResult(index + 1),
    );

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

    let component!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      component = TestRenderer.create(<HomeScreen />);
      await Promise.resolve();
    });

    expect(countRenderedViews(component, 'home-hero')).toBe(1);
    expect(countRenderedViews(component, 'home-row')).toBe(9);

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
    expect(countRenderedViews(component, 'home-row')).toBe(0);
    expect(component.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(component.root.findAllByType(Text)).toHaveLength(0);

    await act(async () => {
      queries.forEach(query => query.resolveRefresh());
      await refreshPromise;
    });

    expect(prepareMovieImages).toHaveBeenCalledTimes(2);
    expect(countRenderedViews(component, 'home-hero')).toBe(1);
    expect(countRenderedViews(component, 'home-row')).toBe(9);

    act(() => component.unmount());
  });
});
