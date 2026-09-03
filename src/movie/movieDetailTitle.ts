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
export type MovieDetailTitles = {
  primaryTitle: string;
  alternateTitles: string[];
};

export function getMovieDetailTitles(movie: movieType): MovieDetailTitles {
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
    return { primaryTitle: currentTitle, alternateTitles: [] };
  }

  const usTitle = usTitleEntry.title.trim();

  if (
    normalizeTitleForComparison(usTitle) ===
    normalizeTitleForComparison(currentTitle)
  ) {
    return { primaryTitle: currentTitle, alternateTitles: [] };
  }

  return { primaryTitle: usTitle, alternateTitles: [currentTitle] };
}
