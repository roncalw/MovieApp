import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import { refreshActiveInfiniteSearch } from '../src/search/shared/refreshActiveInfiniteSearch';

type TestPage = {
  page: number;
  requestNumber: number;
};

describe('active infinite-search refresh', () => {
  test('clears every loaded page before requesting a new first page', async () => {
    const queryClient = new QueryClient();
    const queryKey = ['movieTitleSearch', 'Matrix'] as const;
    const oldData: InfiniteData<TestPage, number> = {
      pages: [
        { page: 1, requestNumber: 1 },
        { page: 2, requestNumber: 2 },
      ],
      pageParams: [1, 2],
    };
    const fetchFirstPage = jest.fn(async () => ({
      page: 1,
      requestNumber: 3,
    }));
    queryClient.setQueryData(queryKey, oldData);

    const pendingRefresh = refreshActiveInfiniteSearch({
      queryClient,
      queryKey,
      firstPageParam: 1,
      fetchFirstPage,
    });

    expect(queryClient.getQueryData(queryKey)).toEqual({
      pages: [],
      pageParams: [],
    });

    const refreshedPage = await pendingRefresh;
    const refreshedData =
      queryClient.getQueryData<InfiniteData<TestPage, number>>(queryKey);

    expect(fetchFirstPage).toHaveBeenCalledTimes(1);
    expect(refreshedPage).toEqual({ page: 1, requestNumber: 3 });
    expect(refreshedData).toEqual({
      pages: [{ page: 1, requestNumber: 3 }],
      pageParams: [1],
    });
    queryClient.clear();
  });

  test('supports the null initial cursor used by Advanced Search', async () => {
    const queryClient = new QueryClient();
    const queryKey = ['movieSearch', { sort: 'popular' }] as const;

    await refreshActiveInfiniteSearch({
      queryClient,
      queryKey,
      firstPageParam: null as string | null,
      fetchFirstPage: async () => ({ page: 1, requestNumber: 1 }),
    });

    expect(queryClient.getQueryData(queryKey)).toEqual({
      pages: [{ page: 1, requestNumber: 1 }],
      pageParams: [null],
    });
    queryClient.clear();
  });

  test('restores the previous pages when the replacement request fails', async () => {
    const queryClient = new QueryClient();
    const queryKey = ['movieTitleSearch', 'Matrix'] as const;
    const oldData: InfiniteData<TestPage, number> = {
      pages: [
        { page: 1, requestNumber: 1 },
        { page: 2, requestNumber: 2 },
      ],
      pageParams: [1, 2],
    };
    const requestError = new Error('Network unavailable');
    queryClient.setQueryData(queryKey, oldData);

    await expect(
      refreshActiveInfiniteSearch({
        queryClient,
        queryKey,
        firstPageParam: 1,
        fetchFirstPage: async () => {
          throw requestError;
        },
      }),
    ).rejects.toBe(requestError);

    expect(queryClient.getQueryData(queryKey)).toEqual(oldData);
    queryClient.clear();
  });
});
