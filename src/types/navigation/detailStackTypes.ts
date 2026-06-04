/**
 * Type definitions for the detail overlay stack.
 *
 * A "stack" is the ordered pile of detail pages currently opened on top of the
 * original screen. A "stack entry" is one item in that pile: either a movie page
 * or a person page. This lets the app open movie -> actor -> movie -> actor
 * chains while still knowing what to close when the user goes back one layer.
 */

import type { movieType } from '../movie/MovieTypes';

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

export type DetailStackOverlayProps = {
  detailStack: DetailStackEntry[];
  onPopDetail: () => void;
  onCloseAllDetails: () => void;
  onPushMovie: (movie: movieType) => void;
  onPushPerson: (personId: number, initialPersonName?: string) => void;
};
