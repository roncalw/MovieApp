import { useCallback, useMemo, useRef } from 'react';
import type {
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
} from 'react-native';

const FILTER_SWIPE_UP_MIN_DISTANCE = 35;
const FILTER_SWIPE_UP_VERTICAL_DOMINANCE = 1.5;

export function isFilterSwipeUpGesture(gesture: { dx: number; dy: number }) {
  const verticalDistance = Math.abs(gesture.dy);
  const horizontalDistance = Math.abs(gesture.dx);

  return (
    gesture.dy <= -FILTER_SWIPE_UP_MIN_DISTANCE &&
    verticalDistance > horizontalDistance * FILTER_SWIPE_UP_VERTICAL_DOMINANCE
  );
}

type ResultListGestureHandlers = Pick<
  ScrollViewProps,
  'onStartShouldSetResponderCapture' | 'onTouchMove' | 'onTouchEnd' | 'onScroll'
>;

/**
 * Coordinates one gesture across the two views that receive its events.
 *
 * The filter-fields View reports where the finger first touched the screen.
 * The page's scrolling list then reports either raw touch movement or its
 * native scroll distance. Using the list as the shared movement owner lets an
 * upward filter swipe coexist with the list's pull-to-refresh gesture.
 */
export function useAdvancedFilterSwipe(onSwipeUp: () => void) {
  const currentScrollYRef = useRef(0);
  const startPointRef = useRef<{
    pageX: number;
    pageY: number;
    scrollY: number;
  } | null>(null);

  const onResultsTouchStartCapture = useCallback(() => {
    // Clear any unfinished native scroll before the filter child records this
    // gesture. Returning false observes the touch without taking it from the
    // list, its refresh control, or any filter input.
    startPointRef.current = null;
    return false;
  }, []);

  const onFilterAreaTouchStart = useCallback((event: GestureResponderEvent) => {
    startPointRef.current = {
      pageX: event.nativeEvent.pageX,
      pageY: event.nativeEvent.pageY,
      scrollY: currentScrollYRef.current,
    };
  }, []);

  const onResultsTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      const startPoint = startPointRef.current;
      if (!startPoint) {
        return;
      }

      const gesture = {
        dx: event.nativeEvent.pageX - startPoint.pageX,
        dy: event.nativeEvent.pageY - startPoint.pageY,
      };

      if (isFilterSwipeUpGesture(gesture)) {
        startPointRef.current = null;
        onSwipeUp();
      }
    },
    [onSwipeUp],
  );

  const onListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const startPoint = startPointRef.current;

      if (
        startPoint &&
        currentScrollY - startPoint.scrollY >= FILTER_SWIPE_UP_MIN_DISTANCE
      ) {
        startPointRef.current = null;
        onSwipeUp();
      }

      currentScrollYRef.current = currentScrollY;
    },
    [onSwipeUp],
  );

  const onResultsTouchEnd = useCallback(() => {
    startPointRef.current = null;
  }, []);

  const cancelFilterSwipeTracking = useCallback(() => {
    startPointRef.current = null;
  }, []);

  const resultListGestureHandlers = useMemo<ResultListGestureHandlers>(
    () => ({
      onStartShouldSetResponderCapture: onResultsTouchStartCapture,
      onTouchMove: onResultsTouchMove,
      onTouchEnd: onResultsTouchEnd,
      onScroll: onListScroll,
    }),
    [
      onListScroll,
      onResultsTouchEnd,
      onResultsTouchMove,
      onResultsTouchStartCapture,
    ],
  );

  return {
    cancelFilterSwipeTracking,
    onFilterAreaTouchStart,
    resultListGestureHandlers,
  };
}
