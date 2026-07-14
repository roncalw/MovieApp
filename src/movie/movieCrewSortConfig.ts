/**
 * Movie Detail crew ordering configuration.
 *
 * Rules are checked from top to bottom, and the first matching rule wins.
 * Change this list when the Movie Detail crew priorities need to change; the
 * sorting implementation does not need to be rewritten.
 */
export type MovieCrewRolePriorityRule = {
  excludes?: readonly string[];
  id: string;
  match: 'exact' | 'includes';
  jobs: readonly string[];
};

export const MOVIE_DETAIL_CREW_SORT_CONFIG = {
  picturesFirst: true,
  rolePriority: [
    {
      id: 'executive-producers',
      match: 'exact',
      jobs: ['Executive Producer'],
    },
    {
      id: 'producers',
      match: 'exact',
      jobs: ['Producer'],
    },
    {
      id: 'assistant-producers',
      match: 'exact',
      jobs: ['Assistant Producer'],
    },
    {
      id: 'directors',
      match: 'exact',
      jobs: ['Director'],
    },
    {
      excludes: ['Casting'],
      id: 'other-directors',
      match: 'includes',
      jobs: ['Director'],
    },
    {
      id: 'casting',
      match: 'includes',
      jobs: ['Casting'],
    },
  ] satisfies readonly MovieCrewRolePriorityRule[],
} as const;
