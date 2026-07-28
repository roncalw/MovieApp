import {
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';

type RefreshActiveInfiniteSearchOptions<TPage, TPageParam> = {
  queryClient: QueryClient;
  queryKey: QueryKey;
  firstPageParam: TPageParam;
  fetchFirstPage: () => Promise<TPage>;
};

/**
 * Clears an infinite result set, reruns its first-page request, and stores only
 * that new first page.
 *
 * Emptying both arrays immediately removes the visible cards and discards every
 * previously loaded page and pagination cursor. The replacement request always
 * starts with the search's first-page parameter, so a refresh can never append
 * its response to page 2, page 10, or any other part of the old result set.
 */
export async function refreshActiveInfiniteSearch<TPage, TPageParam>({
  queryClient,
  queryKey,
  firstPageParam,
  fetchFirstPage,
}: RefreshActiveInfiniteSearchOptions<TPage, TPageParam>) {
  const previousData =
    queryClient.getQueryData<InfiniteData<TPage, TPageParam>>(queryKey);
  const cancellation = queryClient.cancelQueries({ queryKey, exact: true });

  queryClient.setQueryData<InfiniteData<TPage, TPageParam>>(queryKey, {
    pages: [],
    pageParams: [],
  });

  await cancellation;
  let refreshedFirstPage: TPage;

  try {
    refreshedFirstPage = await fetchFirstPage();
  } catch (requestError) {
    // A temporary network failure should not leave an active search looking as
    // though it never had results. Restore the exact pages and paging values
    // that were visible before this refresh, then let the caller report the
    // failed request through the normal page-refresh error path.
    if (previousData) {
      queryClient.setQueryData(queryKey, previousData);
    }

    throw requestError;
  }

  queryClient.setQueryData<InfiniteData<TPage, TPageParam>>(queryKey, {
    pages: [refreshedFirstPage],
    pageParams: [firstPageParam],
  });

  return refreshedFirstPage;
}
