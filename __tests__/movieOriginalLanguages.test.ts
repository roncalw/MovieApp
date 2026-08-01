import {
  DEFAULT_MOVIE_ORIGINAL_LANGUAGES,
  normalizeMovieOriginalLanguages,
} from '../src/utils/movieOriginalLanguages';

describe('movie original-language selection', () => {
  test('defaults Advanced Search to English', () => {
    expect(DEFAULT_MOVIE_ORIGINAL_LANGUAGES).toEqual(['en']);
  });

  test('normalizes cache and request values without assuming English', () => {
    expect(normalizeMovieOriginalLanguages([' KO ', 'en', 'ko', 'ZH'])).toEqual(
      ['en', 'ko', 'zh'],
    );
    expect(normalizeMovieOriginalLanguages([])).toEqual([]);
  });
});
