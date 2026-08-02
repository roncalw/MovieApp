import React from 'react';
import { Modal, ScrollView, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import {
  groupLanguagesByFirstLetter,
  LanguageField,
} from '../src/search/advanced/fields/LanguageField';
import { MovieSearchPopupChip } from '../src/search/advanced/fields/MovieSearchFieldShared';
import { scaleSize } from '../src/theme/scale';

const englishLanguage = {
  code: 'en',
  englishName: 'English',
  nativeName: 'English',
};

function renderLanguageField(
  value: string[],
  languages = [englishLanguage],
  onPopupVisibilityChange = jest.fn(),
) {
  let component!: TestRenderer.ReactTestRenderer;

  act(() => {
    component = TestRenderer.create(
      <LanguageField
        value={value}
        onChange={jest.fn()}
        languages={languages}
        isLoading={false}
        isError={false}
        onRetry={jest.fn()}
        onPopupVisibilityChange={onPopupVisibilityChange}
      />,
    );
  });

  return component;
}

describe('LanguageField summary', () => {
  test('clearly labels an unrestricted search as All Languages', () => {
    const component = renderLanguageField([]);

    expect(
      component.root.findByProps({
        accessibilityLabel: 'Show movies in: All Languages',
      }),
    ).toBeDefined();

    act(() => component.unmount());
  });

  test('uses the TMDb English name for a known language code', () => {
    const component = renderLanguageField(['en']);

    expect(
      component.root.findByProps({
        accessibilityLabel: 'Show movies in: English',
      }),
    ).toBeDefined();

    act(() => component.unmount());
  });

  test('groups each horizontal row by the first letter of the English name', () => {
    const rows = groupLanguagesByFirstLetter([
      { label: 'Zulu', value: 'zu' },
      { label: 'Arabic', value: 'ar' },
      { label: 'English', value: 'en' },
      { label: 'Albanian', value: 'sq' },
    ]);

    expect(rows.map(row => row.letter)).toEqual(['A', 'E', 'Z']);
    expect(rows[0].items.map(item => item.label)).toEqual([
      'Albanian',
      'Arabic',
    ]);
    rows.forEach(row => {
      expect(
        row.items.every(item => item.label.startsWith(row.letter)),
      ).toBe(true);
    });
  });

  test('uses horizontally swipeable letter rows and an eight-row viewport', () => {
    const component = renderLanguageField([], [
      englishLanguage,
      {
        code: 'ar',
        englishName: 'Arabic',
        nativeName: 'العربية',
      },
      { code: 'sq', englishName: 'Albanian', nativeName: 'Shqip' },
    ]);

    act(() => {
      component.root
        .findByProps({
          accessibilityLabel: 'Show movies in: All Languages',
        })
        .props.onPress();
    });

    const aRow = component.root.findByProps({ testID: 'language-row-A' });
    expect(aRow.type).toBe(ScrollView);
    expect(aRow.props.horizontal).toBe(true);
    expect(aRow.props.directionalLockEnabled).toBe(true);
    expect(aRow.props.showsHorizontalScrollIndicator).toBe(false);

    const verticalLanguageList = component.root
      .findAllByType(ScrollView)
      .find(scrollView => !scrollView.props.horizontal);
    expect(verticalLanguageList).toBeDefined();
    expect(StyleSheet.flatten(verticalLanguageList?.props.style).height).toBe(
      scaleSize(336),
    );

    const allLanguageChips = component.root.findAllByType(
      MovieSearchPopupChip,
    );
    expect(
      allLanguageChips.some(chip => chip.props.label === 'All Languages'),
    ).toBe(false);

    act(() => component.unmount());
  });

  test('reports popup ownership when the language popup opens and closes', () => {
    const onPopupVisibilityChange = jest.fn();
    const component = renderLanguageField(
      ['en'],
      [englishLanguage],
      onPopupVisibilityChange,
    );

    act(() => {
      component.root
        .findByProps({ accessibilityLabel: 'Show movies in: English' })
        .props.onPress();
    });
    expect(onPopupVisibilityChange).toHaveBeenLastCalledWith(true);

    act(() => {
      component.root.findByType(Modal).props.onRequestClose();
    });
    expect(onPopupVisibilityChange).toHaveBeenLastCalledWith(false);

    act(() => component.unmount());
  });
});
