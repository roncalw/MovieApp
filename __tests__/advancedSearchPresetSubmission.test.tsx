import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { HeaderMovieSearchContext } from '../src/search/advanced/HeaderMovieSearchContext';
import { SubHeaderMovieSearchFields } from '../src/search/advanced/SubHeaderMovieSearchFields';
import type { HeaderMovieSearchContextValue } from '../src/types/search/movieSearchHeaderTypes';

jest.mock('@react-native-vector-icons/ionicons/static', () => () => null);

const mockGenreField = jest.fn((_props: { value: string[] }) => null);
const mockRatingField = jest.fn((_props: { value: string }) => null);
const mockSortField = jest.fn((_props: { value: string }) => null);
const mockStreamerField = jest.fn((_props: { value: string[] }) => null);

jest.mock('../src/search/advanced/fields/GenreField', () => ({
  GenreField: (props: { value: string[] }) => mockGenreField(props),
}));

jest.mock('../src/search/advanced/fields/RatingField', () => ({
  RatingField: (props: { value: string }) => mockRatingField(props),
}));

jest.mock('../src/search/advanced/fields/SortField', () => ({
  SortField: (props: { value: string }) => mockSortField(props),
}));

jest.mock('../src/search/advanced/fields/StreamerField', () => ({
  StreamerField: (props: { value: string[] }) => mockStreamerField(props),
}));

jest.mock('../src/search/advanced/fields/YearWheelField', () => ({
  YearWheelField: () => null,
}));

describe('Home preset submission on Advanced Search', () => {
  test('signals Popular ready only after its visible filters are selected and the page settles', () => {
    const onSubmitFilters = jest.fn();
    const onPresetFiltersReady = jest.fn();
    const pendingFrames: Array<(timestamp: number) => void> = [];
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation(callback => {
        pendingFrames.push(callback);
        return pendingFrames.length;
      });

    const initialContextValue: HeaderMovieSearchContextValue = {
      appliedParams: {
        movieRatings: 'PG',
        beginDate: '2021-01-01',
        endDate: '2026-07-23',
        movieGenres: ['18'],
        movieStreamers: ['8'],
        movieVoteCount: '1000',
        movieSortBy: 'vote_average.desc',
      },
      loadedPages: 0,
      totalPages: null,
      onSubmitFilters,
      onPresetFiltersReady,
      onDisplayedFiltersDirtyChange: jest.fn(),
      excludeSeenMovies: false,
      onToggleExcludeSeenMovies: jest.fn(),
      isSubmitDisabled: false,
      onValidityChange: jest.fn(),
      registerSubmitHandler: jest.fn(),
      submitDraftFilters: jest.fn(),
    };

    let component!: TestRenderer.ReactTestRenderer;
    act(() => {
      component = TestRenderer.create(
        <HeaderMovieSearchContext.Provider value={initialContextValue}>
          <SubHeaderMovieSearchFields />
        </HeaderMovieSearchContext.Provider>,
      );
    });

    const readyContextValue: HeaderMovieSearchContextValue = {
      ...initialContextValue,
      appliedParams: {
        ...initialContextValue.appliedParams,
        movieRatings: '',
        movieGenres: [],
        movieStreamers: [],
        movieVoteCount: '',
        movieSortBy: 'popularity.desc',
      },
      pendingPresetRequestId: 'popular:123',
    };

    act(() => {
      component.update(
        <HeaderMovieSearchContext.Provider value={readyContextValue}>
          <SubHeaderMovieSearchFields />
        </HeaderMovieSearchContext.Provider>,
      );
    });

    expect(mockRatingField).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: '' }),
    );
    expect(mockGenreField).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: [] }),
    );
    expect(mockStreamerField).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: [] }),
    );
    expect(mockSortField).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: '0' }),
    );
    expect(onSubmitFilters).not.toHaveBeenCalled();
    expect(pendingFrames).toHaveLength(1);

    act(() => {
      pendingFrames.shift()?.(0);
    });
    expect(onSubmitFilters).not.toHaveBeenCalled();
    expect(pendingFrames).toHaveLength(1);

    act(() => {
      pendingFrames.shift()?.(0);
    });

    expect(onSubmitFilters).not.toHaveBeenCalled();
    expect(onPresetFiltersReady).toHaveBeenCalledWith('popular:123');

    act(() => component.unmount());
  });
});
