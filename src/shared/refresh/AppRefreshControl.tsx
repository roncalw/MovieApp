/** Native refresh indicator shared by MovieApp pages and lists. */
import React from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

export type AppRefreshControlProps = {
  onRefresh: () => void;
  refreshing: boolean;
};

/*
 * React Native handles RefreshControl differently on Android. ScrollView
 * clones this component, injects its native scrolling view as `children`, and
 * moves the outer layout styles here. Forwarding both values is therefore part
 * of the component contract: dropping either one can leave the Android page
 * blank even though the same code still renders correctly on iOS.
 */
type AppRefreshControlComponentProps = AppRefreshControlProps &
  Pick<RefreshControlProps, 'children' | 'style'>;

export function AppRefreshControl({
  children,
  onRefresh,
  refreshing,
  style,
}: AppRefreshControlComponentProps) {
  const insets = useSafeAreaInsets();

  return (
    <RefreshControl
      colors={[colors.brandText]}
      onRefresh={onRefresh}
      progressViewOffset={insets.top}
      progressBackgroundColor={colors.surfaceWhite}
      refreshing={refreshing}
      style={style}
      tintColor={colors.brandText}
    >
      {children}
    </RefreshControl>
  );
}
