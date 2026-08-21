import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { StoredMovieListScreen } from '../src/drawer/StoredMovieListScreen';
import { loadMovieCardDataForMovies } from '../src/utils/storage/movieCardData';
import { getStoredMovieList } from '../src/utils/storage/movieUserListsStorage';
import type { movieType } from '../src/types/movie/MovieTypes';

let mockFocusEffectCallback:
  | (() => void | (() => void))
  | undefined;

jest.mock('@react-navigation/native', () => ({
  DrawerActions: { openDrawer: jest.fn() },
  useFocusEffect: (callback: () => void | (() => void)) => {
    mockFocusEffectCallback = callback;
  },
  useNavigation: () => ({ dispatch: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('../src/hooks/useDetailNavigation', () => ({
  useDetailNavigation: () => ({ openMovieDetail: jest.fn() }),
}));

jest.mock('../src/utils/storage/movieCardData', () => ({
  loadMovieCardDataForMovies: jest.fn(),
}));

jest.mock('../src/utils/storage/movieUserListsStorage', () => ({
  getStoredMovieList: jest.fn(),
  storedMovieToMovieType: (movie: movieType) => movie,
}));

jest.mock('../src/shared/refresh/usePageRefresh', () => ({
  usePageRefresh: (onRefresh: () => Promise<void>) => ({
    onRefresh,
    refreshing: false,
  }),
}));

jest.mock('../src/search/results/MovieResults', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    MovieResults: ({ movies, ListHeaderComponent, onRefresh }: any) =>
      MockReact.createElement(
        MockView,
        { testID: 'stored-movie-results', movies, onRefresh },
        ListHeaderComponent,
      ),
  };
});

jest.mock('../src/shared/refresh/RefreshableScrollView', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    RefreshableScrollView: ({ children, onRefresh }: any) =>
      MockReact.createElement(
        MockView,
        { testID: 'stored-movie-empty-list', onRefresh },
        children,
      ),
  };
});

jest.mock('../src/shared/header/DrawerScreenHeader', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    DrawerScreenHeader: () =>
      MockReact.createElement(MockView, { testID: 'stored-movie-header' }),
  };
});

jest.mock('../src/shared/header/HeaderNavButton', () => ({
  HeaderNavButton: () => null,
}));

function movie(id: number) {
  return { id, title: `Movie ${id}`, vote_average: 7 } as movieType;
}

async function runCurrentFocusEffect(): Promise<(() => void) | undefined> {
  const cleanupHolder: { current?: () => void } = {};

  await act(async () => {
    const cleanup = mockFocusEffectCallback?.();

    if (typeof cleanup === 'function') {
      cleanupHolder.current = cleanup;
    }

    await Promise.resolve();
    await Promise.resolve();
  });

  return cleanupHolder.current;
}

function hasLoadingMessage(component: TestRenderer.ReactTestRenderer) {
  return component.root
    .findAllByType(Text)
    .some(node => node.props.children === 'Loading movies...');
}

describe('StoredMovieListScreen focus synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffectCallback = undefined;
    jest
      .mocked(loadMovieCardDataForMovies)
      .mockImplementation(async movies => movies);
  });

  test.each([
    ['Favorites', 'movieFavoritesData' as const],
    ['Seen', 'movieSeenData' as const],
  ])(
    'keeps the populated %s grid unchanged when its saved IDs did not change',
    async (_label, storageKey) => {
      const savedMovie = movie(1);
      jest.mocked(getStoredMovieList).mockResolvedValue([savedMovie as any]);

      let component!: TestRenderer.ReactTestRenderer;
      act(() => {
        component = TestRenderer.create(
          <StoredMovieListScreen
            title="Stored Movies"
            emptyMessage="No stored movies."
            storageKey={storageKey}
          />,
        );
      });

      const firstCleanup = await runCurrentFocusEffect();
      const firstMovies = component.root.findByProps({
        testID: 'stored-movie-results',
      }).props.movies;

      expect(hasLoadingMessage(component)).toBe(false);
      expect(loadMovieCardDataForMovies).toHaveBeenCalledTimes(1);

      act(() => firstCleanup?.());
      const secondCleanup = await runCurrentFocusEffect();
      const secondMovies = component.root.findByProps({
        testID: 'stored-movie-results',
      }).props.movies;

      expect(secondMovies).toBe(firstMovies);
      expect(hasLoadingMessage(component)).toBe(false);
      expect(loadMovieCardDataForMovies).toHaveBeenCalledTimes(1);

      act(() => secondCleanup?.());
      act(() => component.unmount());
    },
  );

  test('removes an unfavorited movie without performing another card-data load', async () => {
    const firstMovie = movie(1);
    const removedMovie = movie(2);
    jest
      .mocked(getStoredMovieList)
      .mockResolvedValueOnce([firstMovie as any, removedMovie as any])
      .mockResolvedValueOnce([firstMovie as any]);

    let component!: TestRenderer.ReactTestRenderer;
    act(() => {
      component = TestRenderer.create(
        <StoredMovieListScreen
          title="My Movie Favorites"
          emptyMessage="No favorite movies yet."
          storageKey="movieFavoritesData"
        />,
      );
    });

    const firstCleanup = await runCurrentFocusEffect();
    act(() => firstCleanup?.());
    const secondCleanup = await runCurrentFocusEffect();
    const renderedMovies = component.root.findByProps({
      testID: 'stored-movie-results',
    }).props.movies as movieType[];

    expect(renderedMovies.map(renderedMovie => renderedMovie.id)).toEqual([1]);
    expect(loadMovieCardDataForMovies).toHaveBeenCalledTimes(1);
    expect(hasLoadingMessage(component)).toBe(false);

    act(() => secondCleanup?.());
    act(() => component.unmount());
  });

  test('loads card data only for a newly added saved movie', async () => {
    const firstMovie = movie(1);
    const addedMovie = { ...movie(2), vote_average: 8 };
    jest
      .mocked(getStoredMovieList)
      .mockResolvedValueOnce([firstMovie as any])
      .mockResolvedValueOnce([firstMovie as any, addedMovie as any]);

    let component!: TestRenderer.ReactTestRenderer;
    act(() => {
      component = TestRenderer.create(
        <StoredMovieListScreen
          title="Movies I Have Seen"
          emptyMessage="No seen movies yet."
          storageKey="movieSeenData"
        />,
      );
    });

    const firstCleanup = await runCurrentFocusEffect();
    act(() => firstCleanup?.());
    const secondCleanup = await runCurrentFocusEffect();
    const renderedMovies = component.root.findByProps({
      testID: 'stored-movie-results',
    }).props.movies as movieType[];

    expect(loadMovieCardDataForMovies).toHaveBeenCalledTimes(2);
    expect(
      jest.mocked(loadMovieCardDataForMovies).mock.calls[1][0].map(
        loadedMovie => loadedMovie.id,
      ),
    ).toEqual([2]);
    expect(renderedMovies.map(renderedMovie => renderedMovie.id)).toEqual([
      2, 1,
    ]);
    expect(hasLoadingMessage(component)).toBe(false);

    act(() => secondCleanup?.());
    act(() => component.unmount());
  });
});
