import type { movieType } from '../types/movie/MovieTypes';

export type HomeQueryState = {
  data: movieType[] | undefined;
  isError: boolean;
  error: unknown;
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
