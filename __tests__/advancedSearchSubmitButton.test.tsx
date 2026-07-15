import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { SubHeaderTop } from '../src/search/advanced/SubHeaderTop';
import { useHeaderMovieSearchContext } from '../src/search/advanced/HeaderMovieSearchContext';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('../src/shared/header/HeaderActionRow', () => ({
  HeaderActionRow: ({ right }: { right: React.ReactNode }) => right,
}));

jest.mock('../src/shared/header/HeaderNavButton', () => ({
  HeaderNavButton: () => null,
}));

jest.mock('../src/search/advanced/HeaderMovieSearchContext', () => ({
  useHeaderMovieSearchContext: jest.fn(),
}));

const mockUseHeaderMovieSearchContext =
  useHeaderMovieSearchContext as jest.MockedFunction<
    typeof useHeaderMovieSearchContext
  >;

function renderSubmitButton(isSubmitDisabled: boolean) {
  const submitDraftFilters = jest.fn();
  mockUseHeaderMovieSearchContext.mockReturnValue({
    appliedParams: {
      movieRatings: '',
      beginDate: '2021-01-01',
      endDate: '2026-12-31',
      movieGenres: [],
      movieStreamers: [],
      movieVoteCount: '',
      movieSortBy: '',
    },
    loadedPages: 0,
    totalPages: null,
    onSubmitFilters: jest.fn(),
    onDisplayedFiltersDirtyChange: jest.fn(),
    excludeSeenMovies: false,
    onToggleExcludeSeenMovies: jest.fn(),
    isSubmitDisabled,
    onValidityChange: jest.fn(),
    registerSubmitHandler: jest.fn(),
    submitDraftFilters,
  });

  let component!: TestRenderer.ReactTestRenderer;
  act(() => {
    component = TestRenderer.create(
      <SubHeaderTop title="Movie Search" onRequestDrawerOpen={jest.fn()} />,
    );
  });

  const button = component.root.findByProps({
    accessibilityLabel: 'Submit advanced movie search',
  });

  return { button, component, submitDraftFilters };
}

describe('Advanced Search Submit button', () => {
  test('is disabled and visibly dimmed while a search is submitting', () => {
    const { button, component } = renderSubmitButton(true);

    expect(button.props.disabled).toBe(true);
    expect(button.props.accessibilityState).toEqual({ disabled: true });
    expect(StyleSheet.flatten(button.props.style).opacity).toBe(0.45);

    act(() => component.unmount());
  });

  test('is enabled and invokes submit after the search finishes', () => {
    const { button, component, submitDraftFilters } = renderSubmitButton(false);

    expect(button.props.disabled).toBe(false);
    expect(button.props.accessibilityState).toEqual({ disabled: false });
    expect(StyleSheet.flatten(button.props.style).opacity).toBeUndefined();

    act(() => button.props.onPress());
    expect(submitDraftFilters).toHaveBeenCalledTimes(1);

    act(() => component.unmount());
  });
});
