import type { movieCrewProfile } from '../types/movie/MovieTypes';
import {
  MOVIE_DETAIL_CREW_SORT_CONFIG,
  type MovieCrewRolePriorityRule,
} from './movieCrewSortConfig';

type IndexedCrewMember = {
  originalIndex: number;
  person: movieCrewProfile;
};

export function sortMovieDetailCrew(crew: movieCrewProfile[]) {
  return crew
    .map(
      (person, originalIndex): IndexedCrewMember => ({
        originalIndex,
        person,
      }),
    )
    .sort(compareCrewMembers)
    .map(({ person }) => person);
}

function compareCrewMembers(left: IndexedCrewMember, right: IndexedCrewMember) {
  const pictureComparison =
    getPictureRank(left.person) - getPictureRank(right.person);

  if (pictureComparison !== 0) {
    return pictureComparison;
  }

  const roleComparison =
    getRoleRank(left.person.job) - getRoleRank(right.person.job);

  if (roleComparison !== 0) {
    return roleComparison;
  }

  const jobComparison = compareText(left.person.job, right.person.job);

  if (jobComparison !== 0) {
    return jobComparison;
  }

  const nameComparison = compareText(left.person.name, right.person.name);

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

function getRoleRank(job: string) {
  const matchingRuleIndex =
    MOVIE_DETAIL_CREW_SORT_CONFIG.rolePriority.findIndex(rule =>
      jobMatchesRule(job, rule),
    );

  return matchingRuleIndex === -1
    ? MOVIE_DETAIL_CREW_SORT_CONFIG.rolePriority.length
    : matchingRuleIndex;
}

function jobMatchesRule(job: string, rule: MovieCrewRolePriorityRule) {
  const normalizedJob = normalizeText(job);
  const isExcluded = rule.excludes?.some(excludedJob =>
    normalizedJob.includes(normalizeText(excludedJob)),
  );

  if (isExcluded) {
    return false;
  }

  return rule.jobs.some(configuredJob => {
    const normalizedConfiguredJob = normalizeText(configuredJob);

    return rule.match === 'exact'
      ? normalizedJob === normalizedConfiguredJob
      : normalizedJob.includes(normalizedConfiguredJob);
  });
}

function compareText(left: string, right: string) {
  return normalizeText(left).localeCompare(normalizeText(right));
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('en-US');
}
