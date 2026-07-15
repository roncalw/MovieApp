/**
 * Shared styles for drawer-hosted utility screens.
 *
 * Imported by:
 * - src/drawer/StoredMovieListScreen.tsx
 * - src/drawer/PrivacyPolicyScreen.tsx
 * - src/drawer/PlaceholderScreen.tsx
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const drawerScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flex: 1,
  },
  utilityScrollContent: {
    flexGrow: 1,
  },
  storedMovieScrollContent: {
    flexGrow: 1,
  },
  storedMovieListHeader: {
    marginTop: -scaleSize(24),
    marginHorizontal: -scaleSize(20),
    marginBottom: scaleSize(24),
  },
  storedMovieLoadingStatus: {
    minHeight: scaleSize(110),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(12),
    color: colors.brandText,
    textAlign: 'center',
  },
  webViewFrame: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
});
