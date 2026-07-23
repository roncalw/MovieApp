import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { HeaderMovieSearchContext } from '../src/search/advanced/HeaderMovieSearchContext';
import {
  isFilterSwipeUpGesture,
  SubHeaderMovieSearchFields,
} from '../src/search/advanced/SubHeaderMovieSearchFields';
import type {
  AdvancedFilterSwipeHandlers,
  HeaderMovieSearchContextValue,
} from '../src/types/search/movieSearchHeaderTypes';

jest.mock('@react-native-vector-icons/ionicons/static', () => () => null);
jest.mock('../src/search/advanced/fields/GenreField', () => ({
  GenreField: () => null,
}));
jest.mock('../src/search/advanced/fields/RatingField', () => ({
  RatingField: () => null,
}));
jest.mock('../src/search/advanced/fields/SortField', () => ({
  SortField: () => null,
}));
jest.mock('../src/search/advanced/fields/StreamerField', () => ({
  StreamerField: () => null,
}));
jest.mock('../src/search/advanced/fields/YearWheelField', () => ({
  YearWheelField: () => null,
}));

let registeredFilterSwipeHandlers: AdvancedFilterSwipeHandlers | null = null;

const contextValue: HeaderMovieSearchContextValue = {
  appliedParams: {
    movieRatings: '',
    beginDate: '2020-01-01',
    endDate: '2026-07-23',
    movieGenres: [],
    movieStreamers: [],
    movieVoteCount: '',
    movieSortBy: '',
  },
  loadedPages: 0,
  totalPages: null,
  onSubmitFilters: jest.fn(),
  onPresetFiltersReady: jest.fn(),
  onDisplayedFiltersDirtyChange: jest.fn(),
  excludeSeenMovies: false,
  onToggleExcludeSeenMovies: jest.fn(),
  isSubmitDisabled: false,
  onValidityChange: jest.fn(),
  registerSubmitHandler: jest.fn(),
  submitDraftFilters: jest.fn(),
  registerFilterSwipeHandlers: handlers => {
    registeredFilterSwipeHandlers = handlers;
  },
};

function touchEvent(pageX: number, pageY: number) {
  return {
    nativeEvent: { pageX, pageY },
  };
}

describe('Advanced Search swipe-to-hide filters', () => {
  test('recognizes a deliberate upward swipe but rejects other drags', () => {
    expect(isFilterSwipeUpGesture({ dx: 4, dy: -50 })).toBe(true);
    expect(isFilterSwipeUpGesture({ dx: 0, dy: -20 })).toBe(false);
    expect(isFilterSwipeUpGesture({ dx: 60, dy: -50 })).toBe(false);
    expect(isFilterSwipeUpGesture({ dx: 0, dy: 50 })).toBe(false);
  });

  test('hides the visible filters after swiping upward within the fields area', () => {
    let component!: TestRenderer.ReactTestRenderer;
    act(() => {
      component = TestRenderer.create(
        <HeaderMovieSearchContext.Provider value={contextValue}>
          <SubHeaderMovieSearchFields />
        </HeaderMovieSearchContext.Provider>,
      );
    });

    const fieldsArea = component.root.findByProps({
      testID: 'advanced-search-filter-fields-area',
    });

    act(() => {
      fieldsArea.props.onTouchStart(touchEvent(100, 200));
      registeredFilterSwipeHandlers?.onMove(touchEvent(102, 150) as never);
    });

    const showFilterLabels = component.root.findAll(
      node => node.type === Text && node.props.children === 'Show Filter',
    );
    expect(showFilterLabels).toHaveLength(1);
    expect(
      component.root.findAllByProps({
        testID: 'advanced-search-filter-fields-area',
      }),
    ).toHaveLength(0);

    act(() => component.unmount());
  });

  test('keeps the filters visible for a tap or short upward movement', () => {
    let component!: TestRenderer.ReactTestRenderer;
    act(() => {
      component = TestRenderer.create(
        <HeaderMovieSearchContext.Provider value={contextValue}>
          <SubHeaderMovieSearchFields />
        </HeaderMovieSearchContext.Provider>,
      );
    });

    const fieldsArea = component.root.findByProps({
      testID: 'advanced-search-filter-fields-area',
    });

    act(() => {
      fieldsArea.props.onTouchStart(touchEvent(100, 200));
      registeredFilterSwipeHandlers?.onMove(touchEvent(100, 180) as never);
      registeredFilterSwipeHandlers?.onEnd();
    });

    const hideFilterLabels = component.root.findAll(
      node => node.type === Text && node.props.children === 'Hide Filter',
    );
    const showFilterLabels = component.root.findAll(
      node => node.type === Text && node.props.children === 'Show Filter',
    );
    expect(hideFilterLabels).toHaveLength(1);
    expect(showFilterLabels).toHaveLength(0);

    act(() => component.unmount());
  });
});
