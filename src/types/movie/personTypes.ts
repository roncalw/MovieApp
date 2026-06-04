/**
 * Type definitions for the Person Detail page.
 *
 * These types describe the actor/crew popup page and the filmography data shown
 * there. A filmography group combines multiple roles for the same movie so a
 * person who directed, produced, and wrote one title appears once with the roles
 * listed together.
 */

import type { movieType } from './MovieTypes';

export type PersonDetailProps = {
  personId: number;
  initialPersonName?: string;
  onBackPress: () => void;
  onCloseAllPress: () => void;
  onMoviePress: (movie: movieType) => void;
};

export type FilmographyItem = {
  key: string;
  movie: movieType;
  title: string;
  year: string;
  roleLabel: string;
  releaseDate: string;
  popularity: number;
};

export type FilmographyGroup = Omit<FilmographyItem, 'roleLabel'> & {
  roles: string[];
};
