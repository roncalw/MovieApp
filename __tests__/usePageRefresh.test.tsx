import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import {
  getRemainingPageRefreshDuration,
  MINIMUM_PAGE_REFRESH_DURATION_MS,
  usePageRefresh,
  type PageRefreshAction,
} from '../src/shared/refresh/usePageRefresh';

type RefreshState = ReturnType<typeof usePageRefresh>;

function RefreshHarness({
  action,
  capture,
}: {
  action?: PageRefreshAction;
  capture: (state: RefreshState) => void;
}) {
  capture(usePageRefresh(action));
  return null;
}

describe('usePageRefresh', () => {
  test('calculates one shared minimum indicator duration', () => {
    expect(getRemainingPageRefreshDuration(1_000, 1_100)).toBe(
      MINIMUM_PAGE_REFRESH_DURATION_MS - 100,
    );
    expect(getRemainingPageRefreshDuration(1_000, 2_000)).toBe(0);
  });

  test('supports pages that have no data-specific refresh work', async () => {
    jest.useFakeTimers();
    let latestState: RefreshState | undefined;
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <RefreshHarness
          capture={state => {
            latestState = state;
          }}
        />,
      );
    });

    let refresh: Promise<void> | undefined;
    await act(async () => {
      refresh = latestState?.onRefresh();
      await Promise.resolve();
    });

    expect(latestState?.refreshing).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(MINIMUM_PAGE_REFRESH_DURATION_MS);
      await refresh;
    });

    expect(latestState?.refreshing).toBe(false);

    await act(async () => {
      renderer!.unmount();
    });

    jest.useRealTimers();
  });

  test('shows refresh state and ignores a second pull while work is active', async () => {
    jest.useFakeTimers();
    let finishRefresh: (() => void) | undefined;
    let latestState: RefreshState | undefined;
    const refreshAction = jest.fn(
      () =>
        new Promise<void>(resolve => {
          finishRefresh = resolve;
        }),
    );
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <RefreshHarness
          action={refreshAction}
          capture={state => {
            latestState = state;
          }}
        />,
      );
    });

    let firstRefresh: Promise<void> | undefined;
    await act(async () => {
      firstRefresh = latestState?.onRefresh();
      void latestState?.onRefresh();
    });

    expect(refreshAction).toHaveBeenCalledTimes(1);
    expect(latestState?.refreshing).toBe(true);

    await act(async () => {
      finishRefresh?.();
      await Promise.resolve();
    });

    expect(latestState?.refreshing).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(MINIMUM_PAGE_REFRESH_DURATION_MS);
      await firstRefresh;
    });

    expect(latestState?.refreshing).toBe(false);

    let secondRefresh: Promise<void> | undefined;
    await act(async () => {
      secondRefresh = latestState?.onRefresh();
    });

    expect(refreshAction).toHaveBeenCalledTimes(2);
    expect(latestState?.refreshing).toBe(true);

    await act(async () => {
      finishRefresh?.();
      await Promise.resolve();
    });

    expect(latestState?.refreshing).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(MINIMUM_PAGE_REFRESH_DURATION_MS);
      await secondRefresh;
    });

    expect(latestState?.refreshing).toBe(false);

    await act(async () => {
      renderer!.unmount();
    });

    jest.useRealTimers();
  });
});
