import { getPersonFamilyDisplayRows } from '../src/person/components/PersonFamilyDetails';
import type { PersonFamilyResponse } from '../src/types/movie/personTypes';

const baseFamily: PersonFamilyResponse = {
  wikidataId: 'Q35332',
  spouses: [],
  children: [],
  numberOfChildren: null,
  sourceUrl: 'https://www.wikidata.org/wiki/Q35332',
  fetchedAt: '2026-07-13T12:00:00.000Z',
  cacheMaxAgeSeconds: 604800,
};

describe('Person Detail family display rows', () => {
  test('shows current and former marriages with the precision Wikidata supplied', () => {
    const rows = getPersonFamilyDisplayRows({
      family: {
        ...baseFamily,
        spouses: [
          {
            wikidataId: 'Q1',
            name: 'Current Spouse',
            status: 'current',
            startDate: { value: '2019', precision: 'year' },
            endDate: null,
          },
          {
            wikidataId: 'Q2',
            name: 'Former Spouse',
            status: 'former',
            startDate: { value: '2000-07-29', precision: 'day' },
            endDate: { value: '2005-10', precision: 'month' },
          },
        ],
        children: [
          { wikidataId: 'Q3', name: 'Child One' },
          { wikidataId: 'Q4', name: 'Child Two' },
        ],
      },
      hasWikidataId: true,
      isError: false,
      isLoading: false,
    });

    expect(rows).toEqual([
      { label: 'Spouse', value: 'Current Spouse (2019-present)' },
      {
        label: 'Former spouse',
        value: 'Former Spouse (July 29, 2000-October 2005)',
      },
      { label: 'Children', value: 'Child One; Child Two' },
    ]);
  });

  test('uses Not listed only after a successful empty Wikidata response', () => {
    expect(
      getPersonFamilyDisplayRows({
        family: baseFamily,
        hasWikidataId: true,
        isError: false,
        isLoading: false,
      }),
    ).toEqual([
      { label: 'Spouse(s)', value: 'Not listed' },
      { label: 'Children', value: 'Not listed' },
    ]);
  });

  test('uses the reported number of children when no child names are available', () => {
    expect(
      getPersonFamilyDisplayRows({
        family: { ...baseFamily, numberOfChildren: 4 },
        hasWikidataId: true,
        isError: false,
        isLoading: false,
      }),
    ).toContainEqual({ label: 'Children', value: '4' });
  });

  test('distinguishes unavailable and loading states from unlisted data', () => {
    expect(
      getPersonFamilyDisplayRows({
        hasWikidataId: false,
        isError: false,
        isLoading: false,
      }),
    ).toEqual([
      { label: 'Spouse(s)', value: 'Not available' },
      { label: 'Children', value: 'Not available' },
    ]);

    expect(
      getPersonFamilyDisplayRows({
        hasWikidataId: true,
        isError: false,
        isLoading: true,
      }),
    ).toEqual([
      { label: 'Spouse(s)', value: 'Loading...' },
      { label: 'Children', value: 'Loading...' },
    ]);
  });
});
