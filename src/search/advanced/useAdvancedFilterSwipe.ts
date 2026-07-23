import { useCallback, useMemo, useRef } from 'react';
import type { GestureResponderEvent, ScrollViewProps } from 'react-native';

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

type TopSectionTouchHandlers = Pick<
  ScrollViewProps,
  'onTouchMove' | 'onTouchEnd' | 'onTouchCancel'
>;

/**
 * Coordinates one gesture across the two views that receive its events.
 *
 * The filter-fields View reports where the finger first touched the screen.
 * The surrounding refresh ScrollView continues receiving movement so a
 * downward drag can activate pull-to-refresh. If that same touch instead moves
 * deliberately upward, this hook calls onSwipeUp to hide the filter fields.
 */
export function useAdvancedFilterSwipe(onSwipeUp: () => void) {
  const startPointRef = useRef<{ pageX: number; pageY: number } | null>(null);

  const onFilterAreaTouchStart = useCallback((event: GestureResponderEvent) => {
    startPointRef.current = {
      pageX: event.nativeEvent.pageX,
      pageY: event.nativeEvent.pageY,
    };
  }, []);

  const onTopSectionTouchMove = useCallback(
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

  const onTopSectionTouchEnd = useCallback(() => {
    startPointRef.current = null;
  }, []);

  const topSectionTouchHandlers = useMemo<TopSectionTouchHandlers>(
    () => ({
      onTouchMove: onTopSectionTouchMove,
      onTouchEnd: onTopSectionTouchEnd,
      onTouchCancel: onTopSectionTouchEnd,
    }),
    [onTopSectionTouchEnd, onTopSectionTouchMove],
  );

  return {
    onFilterAreaTouchStart,
    topSectionTouchHandlers,
  };
}
