import {
  refreshHomeQueryStates,
  type HomeQueryState,
} from '../src/home/homeLoading';
import type { movieType } from '../src/types/movie/MovieTypes';

function createState(id: number): HomeQueryState {
  return {
    data: [{ id, title: `Movie ${id}` } as movieType],
    error: null,
    isError: false,
    isLoading: false,
  };
}

describe('coordinated Home loading', () => {
  test('starts every category before waiting for any category to finish', async () => {
    const started: number[] = [];
    const resolvers: Array<(value: HomeQueryState) => void> = [];
    const currentStates = Array.from({ length: 10 }, (_, index) =>
      createState(index),
    );
    const refetchers = currentStates.map((_, index) => () => {
      started.push(index);
      return new Promise<HomeQueryState>(resolve => resolvers.push(resolve));
    });

    const refresh = refreshHomeQueryStates(currentStates, refetchers);

    expect(started).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    resolvers.forEach((resolve, index) => resolve(createState(index + 100)));

    await expect(refresh).resolves.toEqual(
      Array.from({ length: 10 }, (_, index) => createState(index + 100)),
    );
  });

  test('retains a failed category while publishing successful categories', async () => {
    const currentStates = [createState(1), createState(2), createState(3)];
    const networkError = new Error('category failed');

    const refreshed = await refreshHomeQueryStates(currentStates, [
      async () => createState(101),
      async () => {
        throw networkError;
      },
      async () => createState(103),
    ]);

    expect(refreshed[0].data?.[0].id).toBe(101);
    expect(refreshed[1]).toEqual({
      ...currentStates[1],
      isError: true,
      error: networkError,
    });
    expect(refreshed[2].data?.[0].id).toBe(103);
  });
});
