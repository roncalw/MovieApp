import type { movieType } from '../types/MovieTypes';

export type DetailStackEntry =
  | {
      type: 'movie';
      movieId: number;
      initialMovie?: movieType | null;
      title?: string;
    }
  | {
      type: 'person';
      personId: number;
      initialPersonName?: string;
    };
