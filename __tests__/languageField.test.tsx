import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { LanguageField } from '../src/search/advanced/fields/LanguageField';
import { MovieSearchFieldTrigger } from '../src/search/advanced/fields/MovieSearchFieldShared';

const englishLanguage = {
  code: 'en',
  englishName: 'English',
  nativeName: 'English',
};

function renderLanguageField(value: string[]) {
  let component!: TestRenderer.ReactTestRenderer;

  act(() => {
    component = TestRenderer.create(
      <LanguageField
        value={value}
        onChange={jest.fn()}
        languages={[englishLanguage]}
        isLoading={false}
        isError={false}
        onRetry={jest.fn()}
      />,
    );
  });

  return component;
}

describe('LanguageField summary', () => {
  test('clearly labels an unrestricted search as All Languages', () => {
    const component = renderLanguageField([]);

    expect(component.root.findByType(MovieSearchFieldTrigger).props.value).toBe(
      'All Languages',
    );

    act(() => component.unmount());
  });

  test('uses the TMDb English name for a known language code', () => {
    const component = renderLanguageField(['en']);

    expect(component.root.findByType(MovieSearchFieldTrigger).props.value).toBe(
      'English',
    );

    act(() => component.unmount());
  });
});
