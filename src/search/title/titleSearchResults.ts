import type { movieType } from '../../types/movie/MovieTypes';

/**
 * Converts a title into the form used only for exact-match comparisons.
 *
 * Customers should not lose an exact match because they entered capital
 * letters differently or included extra spaces. Punctuation remains
 * meaningful, however, so "Heel!" is not treated as the same title as
 * "Heel".
 */
function normalizeTitleForExactMatch(title: string) {
  return title.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Produces the stable order shown by Search by Movie Title.
 *
 * The input can contain several TMDb pages. Duplicate movie ids are removed,
 * exact title matches are placed before title variations, and each group is
 * ordered by TMDb popularity. The original TMDb position settles popularity
 * ties so repeated runs do not rearrange equally popular movies.
 *
 * A new array is returned; TanStack Query's cached TMDb response is never
 * modified in place.
 */
export function rankTitleSearchMovies(
  movies: movieType[],
  submittedTitle: string,
) {
  const normalizedSubmittedTitle = normalizeTitleForExactMatch(submittedTitle);
  const seenMovieIds = new Set<number>();

  return movies
    .filter(movie => {
      if (seenMovieIds.has(movie.id)) {
        return false;
      }

      seenMovieIds.add(movie.id);
      return true;
    })
    .map((movie, originalIndex) => ({
      movie,
      originalIndex,
      isExactMatch:
        normalizeTitleForExactMatch(movie.title) === normalizedSubmittedTitle,
    }))
    .sort((left, right) => {
      if (left.isExactMatch !== right.isExactMatch) {
        return left.isExactMatch ? -1 : 1;
      }

      const popularityDifference =
        (right.movie.popularity ?? 0) - (left.movie.popularity ?? 0);

      return popularityDifference || left.originalIndex - right.originalIndex;
    })
    .map(result => result.movie);
}
