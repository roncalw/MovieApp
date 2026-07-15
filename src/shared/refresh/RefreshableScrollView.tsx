/** ScrollView with MovieApp's shared pull-to-refresh control already attached. */
import React from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import {
  AppRefreshControl,
  type AppRefreshControlProps,
} from './AppRefreshControl';

type RefreshableScrollViewProps = Omit<ScrollViewProps, 'refreshControl'> &
  AppRefreshControlProps;

export function RefreshableScrollView({
  alwaysBounceVertical = true,
  children,
  onRefresh,
  refreshing,
  ...scrollViewProps
}: RefreshableScrollViewProps) {
  return (
    <ScrollView
      {...scrollViewProps}
      alwaysBounceVertical={alwaysBounceVertical}
      refreshControl={
        <AppRefreshControl onRefresh={onRefresh} refreshing={refreshing} />
      }
    >
      {children}
    </ScrollView>
  );
}
