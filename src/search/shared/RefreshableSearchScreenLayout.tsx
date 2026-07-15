import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { AppRefreshControlProps } from '../../shared/refresh/AppRefreshControl';
import { RefreshableScrollView } from '../../shared/refresh/RefreshableScrollView';

type RefreshableSearchScreenLayoutProps = AppRefreshControlProps & {
  topSection: ReactNode;
  children: ReactNode;
};

/**
 * Gives both search pages the same two-part parent structure.
 *
 * The top section owns pull-to-refresh and contains the page header plus the
 * title input or advanced filters. The results section is a separate sibling,
 * so its list cannot compete with the top section for the refresh gesture.
 */
export function RefreshableSearchScreenLayout({
  topSection,
  children,
  ...pageRefresh
}: RefreshableSearchScreenLayoutProps) {
  return (
    <View style={styles.screen}>
      <RefreshableScrollView
        style={styles.topSectionScroll}
        contentContainerStyle={styles.topSectionContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        {...pageRefresh}
      >
        {topSection}
      </RefreshableScrollView>

      <View style={styles.resultsSection}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSectionScroll: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.background,
  },
  topSectionContent: {
    backgroundColor: colors.background,
  },
  resultsSection: {
    flex: 1,
  },
});
