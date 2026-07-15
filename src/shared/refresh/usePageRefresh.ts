/**
 * Shared pull-to-refresh state for native pages.
 *
 * A data-backed page supplies only the work that "reload this page" means. A
 * content-free page can omit that action and still provide the standard pull
 * gesture. This hook owns the repeated UI behavior: showing the indicator,
 * ignoring a second pull while the first is running, and always stopping the
 * indicator after the shared minimum display time. WebView pages cannot use a
 * native ScrollView refresh control, so RefreshableWebView owns its gesture and
 * reuses only the minimum-duration calculation exported here.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type PageRefreshAction = () => Promise<unknown> | unknown;
export const MINIMUM_PAGE_REFRESH_DURATION_MS = 450;
const EMPTY_PAGE_REFRESH: PageRefreshAction = () => undefined;

function wait(milliseconds: number) {
  return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

export function getRemainingPageRefreshDuration(
  refreshStartedAt: number,
  currentTime = Date.now(),
) {
  return Math.max(
    MINIMUM_PAGE_REFRESH_DURATION_MS - (currentTime - refreshStartedAt),
    0,
  );
}

export function usePageRefresh(refreshPage = EMPTY_PAGE_REFRESH) {
  const [refreshing, setRefreshing] = useState(false);
  const isMountedRef = useRef(true);
  const refreshInProgressRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onRefresh = useCallback(async () => {
    if (refreshInProgressRef.current) {
      return;
    }

    refreshInProgressRef.current = true;
    setRefreshing(true);
    const refreshStartedAt = Date.now();

    try {
      await refreshPage();
    } catch (error) {
      console.error('Error refreshing page:', error);
    } finally {
      const remainingIndicatorTime =
        getRemainingPageRefreshDuration(refreshStartedAt);

      if (remainingIndicatorTime > 0) {
        await wait(remainingIndicatorTime);
      }

      refreshInProgressRef.current = false;
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [refreshPage]);

  return { onRefresh, refreshing };
}
