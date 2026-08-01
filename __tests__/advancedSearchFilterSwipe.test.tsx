import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { HeaderMovieSearchContext } from '../src/search/advanced/HeaderMovieSearchContext';
import { SubHeaderMovieSearchFields } from '../src/search/advanced/SubHeaderMovieSearchFields';
import {
  isFilterSwipeUpGesture,
  useAdvancedFilterSwipe,
} from '../src/search/advanced/useAdvancedFilterSwipe';
import type { HeaderMovieSearchContextValue } from '../src/types/search/movieSearchHeaderTypes';

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
jest.mock('../src/search/advanced/fields/LanguageField', () => ({
  LanguageField: () => null,
}));
jest.mock('../src/hooks/useMovieSearchQuery', () => ({
  useMovieLanguagesQuery: () => ({
    data: {
      languages: [
        { code: 'en', englishName: 'English', nativeName: 'English' },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));
jest.mock('../src/search/advanced/fields/YearWheelField', () => ({
  YearWheelField: () => null,
}));

const baseContextValue = {
  appliedParams: {
    movieRatings: '',
    beginDate: '2020-01-01',
    endDate: '2026-07-23',
    movieGenres: [],
    movieStreamers: [],
    movieOriginalLanguages: ['en'],
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
};

function touchEvent(pageX: number, pageY: number) {
  return {
    nativeEvent: { pageX, pageY },
  };
}

function FilterSwipeHarness() {
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const hideFilters = useCallback(() => setIsFiltersVisible(false), []);
  const onToggleFiltersVisibility = useCallback(
    () => setIsFiltersVisible(currentValue => !currentValue),
    [],
  );
  const { onFilterAreaTouchStart, resultListGestureHandlers } =
    useAdvancedFilterSwipe(hideFilters);
  const contextValue: HeaderMovieSearchContextValue = {
    ...baseContextValue,
    isFiltersVisible,
    onToggleFiltersVisibility,
    onFilterAreaTouchStart,
  };

  return (
    <View testID="advanced-search-top-section" {...resultListGestureHandlers}>
      <HeaderMovieSearchContext.Provider value={contextValue}>
        <SubHeaderMovieSearchFields />
      </HeaderMovieSearchContext.Provider>
    </View>
  );
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
      component = TestRenderer.create(<FilterSwipeHarness />);
    });

    const fieldsArea = component.root.findByProps({
      testID: 'advanced-search-filter-fields-area',
    });
    const topSection = component.root.findByProps({
      testID: 'advanced-search-top-section',
    });

    act(() => {
      fieldsArea.props.onTouchStart(touchEvent(100, 200));
      topSection.props.onTouchMove(touchEvent(102, 150));
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

  test('hides filters when the list takes ownership of the upward drag', () => {
    let component!: TestRenderer.ReactTestRenderer;
    act(() => {
      component = TestRenderer.create(<FilterSwipeHarness />);
    });

    const fieldsArea = component.root.findByProps({
      testID: 'advanced-search-filter-fields-area',
    });
    const topSection = component.root.findByProps({
      testID: 'advanced-search-top-section',
    });

    expect(topSection.props.onStartShouldSetResponderCapture()).toBe(false);

    act(() => {
      fieldsArea.props.onTouchStart(touchEvent(100, 200));
      topSection.props.onScroll({
        nativeEvent: { contentOffset: { x: 0, y: 50 } },
      });
    });

    expect(
      component.root.findAll(
        node => node.type === Text && node.props.children === 'Show Filter',
      ),
    ).toHaveLength(1);
    act(() => component.unmount());
  });

  test('keeps the filters visible for a tap or short upward movement', () => {
    let component!: TestRenderer.ReactTestRenderer;
    act(() => {
      component = TestRenderer.create(<FilterSwipeHarness />);
    });

    const fieldsArea = component.root.findByProps({
      testID: 'advanced-search-filter-fields-area',
    });
    const topSection = component.root.findByProps({
      testID: 'advanced-search-top-section',
    });

    act(() => {
      fieldsArea.props.onTouchStart(touchEvent(100, 200));
      topSection.props.onTouchMove(touchEvent(100, 180));
      topSection.props.onTouchEnd();
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
