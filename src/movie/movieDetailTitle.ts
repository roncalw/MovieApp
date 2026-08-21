import type { movieType } from '../types/movie/MovieTypes';

function normalizeTitleForComparison(title: string) {
  return title.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
}

/**
 * Builds the title shown on Movie Detail without changing the movie's stored
 * title. TMDB lists country-specific names under alternative_titles. An
 * unlabelled US entry is preferred because labelled entries can be working or
 * festival titles rather than the normal US release title.
 */
export function getMovieDetailDisplayTitle(movie: movieType) {
  const currentTitle = movie.title;
  const usTitles = (movie.alternative_titles?.titles ?? []).filter(
    alternativeTitle =>
      alternativeTitle.iso_3166_1.toUpperCase() === 'US' &&
      alternativeTitle.title.trim().length > 0,
  );
  const usTitleEntry =
    usTitles.find(alternativeTitle => alternativeTitle.type.trim() === '') ??
    usTitles[0];

  if (!usTitleEntry) {
    return currentTitle;
  }

  const usTitle = usTitleEntry.title.trim();

  if (
    normalizeTitleForComparison(usTitle) ===
    normalizeTitleForComparison(currentTitle)
  ) {
    return currentTitle;
  }

  return `${usTitle} / ${currentTitle}`;
}
