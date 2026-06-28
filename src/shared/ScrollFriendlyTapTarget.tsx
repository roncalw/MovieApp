/**
 * A tap target that does not compete with a surrounding ScrollView or FlatList.
 *
 * Why this component exists:
 * - Large nested Pressables participate in React Native's responder
 *   negotiation. On these detail screens they were interpreting vertical drags
 *   as presses instead of consistently yielding to the parent list.
 * - This component observes touch movement without becoming the responder. A
 *   short stationary touch activates the action; a drag remains owned by the
 *   surrounding vertical or horizontal list.
 *
 * Accessibility activation is handled separately, so VoiceOver and TalkBack
 * users can trigger the same action without relying on touch coordinates.
 */
import React, { useCallback, useRef, type ReactNode } from 'react';
import {
  View,
  type AccessibilityActionEvent,
  type AccessibilityRole,
  type AccessibilityState,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const MAX_TAP_MOVEMENT = 10;

type TouchPosition = {
  pageX: number;
  pageY: number;
};

type ScrollFriendlyTapTargetProps = {
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ScrollFriendlyTapTarget({
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  children,
  disabled = false,
  onPress,
  style,
}: ScrollFriendlyTapTargetProps) {
  const touchStart = useRef<TouchPosition | null>(null);
  const movedBeyondTapDistance = useRef(false);

  const resetTouch = useCallback(() => {
    touchStart.current = null;
    movedBeyondTapDistance.current = false;
  }, []);

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (disabled || event.nativeEvent.touches.length !== 1) {
        resetTouch();
        return;
      }

      touchStart.current = getTouchPosition(event);
      movedBeyondTapDistance.current = false;
    },
    [disabled, resetTouch],
  );

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    if (!touchStart.current) {
      return;
    }

    movedBeyondTapDistance.current =
      movedBeyondTapDistance.current ||
      !isWithinTapDistance(touchStart.current, getTouchPosition(event));
  }, []);

  const handleTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      const start = touchStart.current;
      const shouldActivate =
        !disabled &&
        start !== null &&
        !movedBeyondTapDistance.current &&
        isWithinTapDistance(start, getTouchPosition(event));

      resetTouch();

      if (shouldActivate) {
        onPress();
      }
    },
    [disabled, onPress, resetTouch],
  );

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (!disabled && event.nativeEvent.actionName === 'activate') {
        onPress();
      }
    },
    [disabled, onPress],
  );

  return (
    <View
      accessible={!disabled}
      accessibilityActions={disabled ? undefined : [{ name: 'activate' }]}
      accessibilityLabel={disabled ? undefined : accessibilityLabel}
      accessibilityRole={disabled ? undefined : accessibilityRole}
      accessibilityState={disabled ? undefined : accessibilityState}
      onAccessibilityAction={
        disabled ? undefined : handleAccessibilityAction
      }
      onTouchCancel={disabled ? undefined : resetTouch}
      onTouchEnd={disabled ? undefined : handleTouchEnd}
      onTouchMove={disabled ? undefined : handleTouchMove}
      onTouchStart={disabled ? undefined : handleTouchStart}
      style={style}
    >
      {children}
    </View>
  );
}

function getTouchPosition(event: GestureResponderEvent): TouchPosition {
  return {
    pageX: event.nativeEvent.pageX,
    pageY: event.nativeEvent.pageY,
  };
}

function isWithinTapDistance(
  start: TouchPosition,
  current: TouchPosition,
): boolean {
  return (
    Math.hypot(current.pageX - start.pageX, current.pageY - start.pageY) <=
    MAX_TAP_MOVEMENT
  );
}
