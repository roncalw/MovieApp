import { getMovieDetailDisplayTitle } from '../src/movie/movieDetailTitle';
import type { movieType } from '../src/types/movie/MovieTypes';

function createMovie(
  title: string,
  alternativeTitles: movieType['alternative_titles'],
) {
  return {
    title,
    alternative_titles: alternativeTitles,
  } as movieType;
}

describe('Movie Detail title', () => {
  test('shows a different US title before the current title', () => {
    const movie = createMovie('Good Boy', {
      titles: [{ iso_3166_1: 'US', title: 'Heel', type: '' }],
    });

    expect(getMovieDetailDisplayTitle(movie)).toBe('Heel / Good Boy');
  });

  test('does not duplicate the title when the US and current titles match', () => {
    const movie = createMovie('Good Boy', {
      titles: [{ iso_3166_1: 'US', title: '  good   boy  ', type: '' }],
    });

    expect(getMovieDetailDisplayTitle(movie)).toBe('Good Boy');
  });

  test('leaves the current title unchanged when no US title exists', () => {
    const movie = createMovie('Good Boy', {
      titles: [{ iso_3166_1: 'GB', title: 'The Good Boy', type: '' }],
    });

    expect(getMovieDetailDisplayTitle(movie)).toBe('Good Boy');
  });

  test('prefers the normal US title over a labelled working title', () => {
    const movie = createMovie('Current Title', {
      titles: [
        { iso_3166_1: 'US', title: 'Old Working Name', type: 'working title' },
        { iso_3166_1: 'US', title: 'US Release Name', type: '' },
      ],
    });

    expect(getMovieDetailDisplayTitle(movie)).toBe(
      'US Release Name / Current Title',
    );
  });
});
