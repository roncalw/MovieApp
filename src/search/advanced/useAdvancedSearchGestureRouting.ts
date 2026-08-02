import { useCallback, useMemo, useState } from 'react';
import type {
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
} from 'react-native';
import { useAdvancedFilterSwipe } from './useAdvancedFilterSwipe';

type ResultListGestureHandlers = Pick<
  ScrollViewProps,
  'onStartShouldSetResponderCapture' | 'onTouchMove' | 'onTouchEnd' | 'onScroll'
>;

/**
 * Chooses which visible part of Advanced Search owns a finger movement.
 *
 * When a filter popup is open, its own horizontal or vertical scrolling owns
 * the movement. The page-level filter-collapse gesture is not called at all.
 * When no popup is open, this router delegates to the existing, already-tested
 * page gesture functions without changing their thresholds or behavior.
 */
export function useAdvancedSearchGestureRouting(onFilterSwipeUp: () => void) {
  const [isFilterPopupVisible, setIsFilterPopupVisible] = useState(false);
  const {
    cancelFilterSwipeTracking,
    onFilterAreaTouchStart: onPageFilterAreaTouchStart,
    resultListGestureHandlers: pageGestureHandlers,
  } = useAdvancedFilterSwipe(onFilterSwipeUp);

  const onFilterPopupVisibilityChange = useCallback(
    (isVisible: boolean) => {
      if (isVisible) {
        // A finger may have touched the filter page just before the popup was
        // displayed. Clear that unfinished page gesture so later popup
        // scrolling can never finish it and collapse the filters behind it.
        cancelFilterSwipeTracking();
      }

      setIsFilterPopupVisible(isVisible);
    },
    [cancelFilterSwipeTracking],
  );

  const onFilterAreaTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (isFilterPopupVisible) {
        cancelFilterSwipeTracking();
        return;
      }

      onPageFilterAreaTouchStart(event);
    },
    [
      cancelFilterSwipeTracking,
      isFilterPopupVisible,
      onPageFilterAreaTouchStart,
    ],
  );

  const resultListGestureHandlers = useMemo<ResultListGestureHandlers>(
    () => ({
      onStartShouldSetResponderCapture: (event: GestureResponderEvent) => {
        if (isFilterPopupVisible) {
          cancelFilterSwipeTracking();
          return false;
        }

        return (
          pageGestureHandlers.onStartShouldSetResponderCapture?.(event) ??
          false
        );
      },
      onTouchMove: (event: GestureResponderEvent) => {
        if (isFilterPopupVisible) {
          return;
        }

        pageGestureHandlers.onTouchMove?.(event);
      },
      onTouchEnd: (event: GestureResponderEvent) => {
        if (isFilterPopupVisible) {
          cancelFilterSwipeTracking();
          return;
        }

        pageGestureHandlers.onTouchEnd?.(event);
      },
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isFilterPopupVisible) {
          return;
        }

        pageGestureHandlers.onScroll?.(event);
      },
    }),
    [
      cancelFilterSwipeTracking,
      isFilterPopupVisible,
      pageGestureHandlers,
    ],
  );

  return {
    isFilterPopupVisible,
    onFilterAreaTouchStart,
    onFilterPopupVisibilityChange,
    resultListGestureHandlers,
  };
}
