import { HOME_ADVANCED_SEARCH_SECTIONS } from './homeAdvancedSearchSections';
import type { HomeAdvancedSearchSectionId } from '../types/home/homeTypes';
import type { movieType } from '../types/movie/MovieTypes';

export type HomeCollectionSnapshot = {
  data: movieType[] | undefined;
  isError: boolean;
  error: unknown;
};

export type HomeSnapshot = {
  upcoming: HomeCollectionSnapshot;
  rows: Record<HomeAdvancedSearchSectionId, HomeCollectionSnapshot>;
};

export type HomeQueryState = HomeCollectionSnapshot & {
  isLoading: boolean;
};

type HomeRefetchResult = {
  data: movieType[] | undefined;
  error: unknown;
  isError: boolean;
  isLoading: boolean;
};

export function toHomeQueryState(query: HomeRefetchResult): HomeQueryState {
  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isLoading: query.isLoading,
  };
}

export async function refreshHomeQueryStates(
  currentStates: HomeQueryState[],
  refetchers: ReadonlyArray<() => Promise<HomeRefetchResult>>,
) {
  // Calling map creates every promise before Promise.allSettled starts waiting,
  // so one slow category cannot prevent the other categories from starting.
  const refreshResults = await Promise.allSettled(
    refetchers.map(refetch => refetch()),
  );

  return refreshResults.map((result, index) => {
    if (result.status === 'rejected') {
      return {
        ...currentStates[index],
        isError: true,
        error: result.reason,
      };
    }

    return toHomeQueryState(result.value);
  });
}

export function buildHomeSnapshot(queryStates: HomeQueryState[]): HomeSnapshot {
  const [upcoming, ...rowStates] = queryStates;
  const rows = {} as Record<
    HomeAdvancedSearchSectionId,
    HomeCollectionSnapshot
  >;

  HOME_ADVANCED_SEARCH_SECTIONS.forEach((section, index) => {
    rows[section.id] = rowStates[index];
  });

  return { upcoming, rows };
}

export function getHomeSnapshotCollections(snapshot: HomeSnapshot) {
  return [
    snapshot.upcoming.data,
    ...HOME_ADVANCED_SEARCH_SECTIONS.map(
      section => snapshot.rows[section.id].data,
    ),
  ];
}
