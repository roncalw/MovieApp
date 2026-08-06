import type { movieCrewProfile } from '../types/movie/MovieTypes';
import {
  MOVIE_DETAIL_CREW_SORT_CONFIG,
  type MovieCrewRolePriorityRule,
} from './movieCrewSortConfig';

type IndexedCrewMember = {
  normalizedJob: string;
  normalizedName: string;
  originalIndex: number;
  person: movieCrewProfile;
  pictureRank: number;
  roleRank: number;
};

type NormalizedCrewRolePriorityRule = Omit<
  MovieCrewRolePriorityRule,
  'excludes' | 'jobs'
> & {
  excludes?: readonly string[];
  jobs: readonly string[];
};

/*
  Android's JavaScript engine is extremely slow when locale-aware text methods
  are called repeatedly from an Array.sort comparator. Normalize the small,
  fixed configuration once when this module loads, then normalize each TMDB
  crew member once before sorting. Android and iPhone use this same code path.
*/
const NORMALIZED_ROLE_PRIORITY: readonly NormalizedCrewRolePriorityRule[] =
  MOVIE_DETAIL_CREW_SORT_CONFIG.rolePriority.map(rule => ({
    ...rule,
    excludes: rule.excludes?.map(normalizeText),
    jobs: rule.jobs.map(normalizeText),
  }));

export function sortMovieDetailCrew(crew: movieCrewProfile[]) {
  return crew
    .map(
      (person, originalIndex): IndexedCrewMember => {
        const normalizedJob = normalizeText(person.job);

        return {
          normalizedJob,
          normalizedName: normalizeText(person.name),
          originalIndex,
          person,
          pictureRank: getPictureRank(person),
          roleRank: getRoleRank(normalizedJob),
        };
      },
    )
    .sort(compareCrewMembers)
    .map(({ person }) => person);
}

function compareCrewMembers(left: IndexedCrewMember, right: IndexedCrewMember) {
  const pictureComparison = left.pictureRank - right.pictureRank;

  if (pictureComparison !== 0) {
    return pictureComparison;
  }

  const roleComparison = left.roleRank - right.roleRank;

  if (roleComparison !== 0) {
    return roleComparison;
  }

  const jobComparison = compareNormalizedText(
    left.normalizedJob,
    right.normalizedJob,
  );

  if (jobComparison !== 0) {
    return jobComparison;
  }

  const nameComparison = compareNormalizedText(
    left.normalizedName,
    right.normalizedName,
  );

  if (nameComparison !== 0) {
    return nameComparison;
  }

  return left.originalIndex - right.originalIndex;
}

function getPictureRank(person: movieCrewProfile) {
  if (!MOVIE_DETAIL_CREW_SORT_CONFIG.picturesFirst) {
    return 0;
  }

  return person.profile_path?.trim() ? 0 : 1;
}

function getRoleRank(normalizedJob: string) {
  const matchingRuleIndex =
    NORMALIZED_ROLE_PRIORITY.findIndex(rule =>
      jobMatchesRule(normalizedJob, rule),
    );

  return matchingRuleIndex === -1
    ? NORMALIZED_ROLE_PRIORITY.length
    : matchingRuleIndex;
}

function jobMatchesRule(
  normalizedJob: string,
  rule: NormalizedCrewRolePriorityRule,
) {
  const isExcluded = rule.excludes?.some(excludedJob =>
    normalizedJob.includes(excludedJob),
  );

  if (isExcluded) {
    return false;
  }

  return rule.jobs.some(configuredJob =>
    rule.match === 'exact'
      ? normalizedJob === configuredJob
      : normalizedJob.includes(configuredJob),
  );
}

function compareNormalizedText(left: string, right: string) {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}
