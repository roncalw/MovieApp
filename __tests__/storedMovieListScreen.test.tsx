import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { StoredMovieListScreen } from '../src/drawer/StoredMovieListScreen';
import { loadMovieCardDataForMovies } from '../src/utils/storage/movieCardData';
import {
  getStoredMovieListData,
  saveRefreshedStoredMovieList,
} from '../src/utils/storage/movieUserListsStorage';
import { getLocalCalendarDate } from '../src/utils/storage/localCalendarDate';
import type { movieType } from '../src/types/movie/MovieTypes';

let mockFocusEffectCallback: (() => void | (() => void)) | undefined;

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
  sortMoviesByImdbRating: (movies: movieType[]) =>
    [...movies].sort(
      (left, right) => (right.imdb_rating ?? -1) - (left.imdb_rating ?? -1),
    ),
}));

jest.mock('../src/utils/storage/movieUserListsStorage', () => ({
  getStoredMovieListData: jest.fn(),
  saveRefreshedStoredMovieList: jest.fn(),
  storedMovieHasCompleteCardData: (storedMovie: movieType) =>
    (typeof storedMovie.imdb_rating === 'number' ||
      storedMovie.imdb_rating === null) &&
    typeof storedMovie.available_with_subscription === 'boolean' &&
    typeof storedMovie.available_without_rent_or_purchase === 'boolean',
  storedMovieToMovieType: (storedMovie: movieType) => storedMovie,
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

function movie(id: number, imdbRating = 7) {
  return {
    id,
    title: `Movie ${id}`,
    vote_average: imdbRating,
    imdb_rating: imdbRating,
    available_with_subscription: true,
    available_without_rent_or_purchase: true,
  } as movieType;
}

const today = getLocalCalendarDate();

function storedData(movies: movieType[], date: string | null = today) {
  return {
    movies: movies as any[],
    cardDataRefreshedLocalDate: date,
  };
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
    jest.mocked(saveRefreshedStoredMovieList).mockResolvedValue(true);
  });

  test.each([
    ['Favorites', 'movieFavoritesData' as const],
    ['Seen', 'movieSeenData' as const],
  ])(
    'keeps the populated %s grid unchanged when its saved IDs did not change',
    async (_label, storageKey) => {
      const savedMovie = movie(1);
      jest
        .mocked(getStoredMovieListData)
        .mockResolvedValue(storedData([savedMovie]));

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
      expect(loadMovieCardDataForMovies).not.toHaveBeenCalled();

      act(() => firstCleanup?.());
      const secondCleanup = await runCurrentFocusEffect();
      const secondMovies = component.root.findByProps({
        testID: 'stored-movie-results',
      }).props.movies;

      expect(secondMovies).toBe(firstMovies);
      expect(hasLoadingMessage(component)).toBe(false);
      expect(loadMovieCardDataForMovies).not.toHaveBeenCalled();

      act(() => secondCleanup?.());
      act(() => component.unmount());
    },
  );

  test('removes an unfavorited movie without performing another card-data load', async () => {
    const firstMovie = movie(1);
    const removedMovie = movie(2);
    jest
      .mocked(getStoredMovieListData)
      .mockResolvedValueOnce(storedData([firstMovie, removedMovie]))
      .mockResolvedValueOnce(storedData([firstMovie]));

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
    expect(loadMovieCardDataForMovies).not.toHaveBeenCalled();
    expect(hasLoadingMessage(component)).toBe(false);

    act(() => secondCleanup?.());
    act(() => component.unmount());
  });

  test('loads card data only for a newly added saved movie', async () => {
    const firstMovie = movie(1);
    const addedMovie = {
      ...movie(2, 8),
      imdb_rating: undefined,
      available_with_subscription: undefined,
      available_without_rent_or_purchase: undefined,
    };
    jest
      .mocked(getStoredMovieListData)
      .mockResolvedValueOnce(storedData([firstMovie]))
      .mockResolvedValue(storedData([firstMovie, addedMovie as movieType]));
    jest
      .mocked(loadMovieCardDataForMovies)
      .mockImplementation(async movies =>
        movies.map(loadedMovie => movie(loadedMovie.id, 8)),
      );

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

    expect(loadMovieCardDataForMovies).toHaveBeenCalledTimes(1);
    expect(
      jest
        .mocked(loadMovieCardDataForMovies)
        .mock.calls[0][0].map(loadedMovie => loadedMovie.id),
    ).toEqual([2]);
    expect(renderedMovies.map(renderedMovie => renderedMovie.id)).toEqual([
      2, 1,
    ]);
    expect(hasLoadingMessage(component)).toBe(false);

    act(() => secondCleanup?.());
    act(() => component.unmount());
  });

  test('refreshes every saved movie when the saved local date is older', async () => {
    const savedMovies = [movie(1, 7), movie(2, 8)];
    jest
      .mocked(getStoredMovieListData)
      .mockResolvedValue(storedData(savedMovies, '2026-08-24'));
    jest
      .mocked(loadMovieCardDataForMovies)
      .mockResolvedValue([movie(2, 8), movie(1, 7)]);

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

    const cleanup = await runCurrentFocusEffect();
    const renderedMovies = component.root.findByProps({
      testID: 'stored-movie-results',
    }).props.movies as movieType[];

    expect(loadMovieCardDataForMovies).toHaveBeenCalledTimes(1);
    expect(
      jest
        .mocked(loadMovieCardDataForMovies)
        .mock.calls[0][0].map(loadedMovie => loadedMovie.id),
    ).toEqual([1, 2]);
    expect(renderedMovies.map(renderedMovie => renderedMovie.id)).toEqual([
      2, 1,
    ]);
    expect(saveRefreshedStoredMovieList).toHaveBeenCalledWith(
      'movieFavoritesData',
      expect.any(Array),
      today,
    );

    act(() => cleanup?.());
    act(() => component.unmount());
  });

  test('pull-to-refresh reloads the complete list even on the same day', async () => {
    const savedMovies = [movie(1, 7), movie(2, 8)];
    jest
      .mocked(getStoredMovieListData)
      .mockResolvedValue(storedData(savedMovies));
    jest
      .mocked(loadMovieCardDataForMovies)
      .mockResolvedValue([movie(2, 8), movie(1, 7)]);

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

    const cleanup = await runCurrentFocusEffect();
    const results = component.root.findByProps({
      testID: 'stored-movie-results',
    });

    expect(loadMovieCardDataForMovies).not.toHaveBeenCalled();

    await act(async () => {
      await results.props.onRefresh();
    });

    expect(loadMovieCardDataForMovies).toHaveBeenCalledTimes(1);
    expect(
      jest.mocked(loadMovieCardDataForMovies).mock.calls[0][0],
    ).toHaveLength(2);

    act(() => cleanup?.());
    act(() => component.unmount());
  });
});
