/**
 * Pull-to-refresh adapter for a WebView with a native header above it.
 *
 * React Native's RefreshControl can move a native ScrollView, but it cannot
 * treat a separate native header and WebView as one pullable page. This adapter
 * captures a downward drag only while the WebView is at its top, translates
 * both parts together, reloads the WebView, and uses the same indicator timing
 * as the native refresh controls.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { WebView, type WebViewProps } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { getRemainingPageRefreshDuration } from './usePageRefresh';

const PULL_CAPTURE_DISTANCE = 12;
const REFRESH_TRIGGER_DISTANCE = 72;
const MAX_PULL_DISTANCE = 120;

type RefreshableWebViewProps = WebViewProps & {
  headerComponent?: React.ReactNode;
};

export function RefreshableWebView({
  headerComponent,
  onLoadEnd,
  onScroll,
  ...webViewProps
}: RefreshableWebViewProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const scrollOffsetRef = useRef(0);
  const refreshStartedAtRef = useRef<number | null>(null);
  const refreshCompletionTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const pullOffset = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  const resetPullOffset = useCallback(() => {
    Animated.spring(pullOffset, {
      toValue: 0,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [pullOffset]);

  const finishRefresh = useCallback(() => {
    refreshStartedAtRef.current = null;
    refreshCompletionTimerRef.current = null;
    setRefreshing(false);
    resetPullOffset();
  }, [resetPullOffset]);

  useEffect(
    () => () => {
      if (refreshCompletionTimerRef.current) {
        clearTimeout(refreshCompletionTimerRef.current);
      }
    },
    [],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_event, gestureState) =>
          !refreshing &&
          scrollOffsetRef.current <= 0 &&
          gestureState.dy > PULL_CAPTURE_DISTANCE &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_event, gestureState) => {
          pullOffset.setValue(
            Math.max(0, Math.min(gestureState.dy * 0.5, MAX_PULL_DISTANCE)),
          );
        },
        onPanResponderRelease: (_event, gestureState) => {
          if (gestureState.dy < REFRESH_TRIGGER_DISTANCE) {
            resetPullOffset();
            return;
          }

          setRefreshing(true);
          refreshStartedAtRef.current = Date.now();
          Animated.spring(pullOffset, {
            toValue: insets.top + scaleSize(32),
            damping: 18,
            stiffness: 180,
            mass: 0.8,
            useNativeDriver: true,
          }).start();
          webViewRef.current?.reload();
        },
        onPanResponderTerminate: resetPullOffset,
      }),
    [insets.top, pullOffset, refreshing, resetPullOffset],
  );

  const handleScroll: NonNullable<WebViewProps['onScroll']> = event => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  };

  const handleLoadEnd: NonNullable<WebViewProps['onLoadEnd']> = event => {
    onLoadEnd?.(event);

    if (refreshStartedAtRef.current === null) {
      return;
    }

    const remainingIndicatorTime = getRemainingPageRefreshDuration(
      refreshStartedAtRef.current,
    );

    if (remainingIndicatorTime === 0) {
      finishRefresh();
      return;
    }

    refreshCompletionTimerRef.current = setTimeout(
      finishRefresh,
      remainingIndicatorTime,
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[styles.movingPage, { transform: [{ translateY: pullOffset }] }]}
      >
        {headerComponent}
        <WebView
          {...webViewProps}
          ref={webViewRef}
          onLoadEnd={handleLoadEnd}
          onScroll={handleScroll}
          pullToRefreshEnabled={false}
        />
      </Animated.View>
      {refreshing ? (
        <View
          pointerEvents="none"
          style={[styles.refreshIndicator, { top: insets.top + scaleSize(8) }]}
        >
          <ActivityIndicator color={colors.brandText} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  movingPage: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    padding: scaleSize(8),
    borderRadius: scaleSize(8),
    backgroundColor: colors.surfaceWhite,
  },
});
