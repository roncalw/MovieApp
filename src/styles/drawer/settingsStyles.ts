/**
 * Styles shared by the Settings screen and its settings sections.
 *
 * Imported by:
 * - src/drawer/SettingsScreen.tsx
 * - src/drawer/settings/*Section.tsx
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const settingsStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: scaleSize(142),
    backgroundColor: colors.background,
  },
  title: {
    width: '100%',
    fontSize: scaleSize(22),
    lineHeight: scaleSize(28),
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.brandText,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scaleSize(24),
    paddingTop: scaleSize(28),
  },
  settingBlock: {
    alignItems: 'center',
    marginBottom: scaleSize(28),
  },
  linkText: {
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    fontWeight: '400',
    color: colors.brandText,
    textAlign: 'center',
  },
  versionText: {
    ...typography.summaryBody,
    marginTop: scaleSize(2),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  updateStatusText: {
    ...typography.summaryBody,
    marginTop: scaleSize(2),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  updateAvailableText: {
    color: colors.actionLink,
  },
  storeVersionText: {
    ...typography.summaryBody,
    maxWidth: scaleSize(280),
    marginTop: scaleSize(2),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listCountText: {
    ...typography.summaryBody,
    marginTop: scaleSize(2),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  notificationBlock: {
    alignItems: 'center',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationSwitch: {
    marginLeft: scaleSize(6),
    transform: [{ scale: 0.75 }],
  },
  subscriptionText: {
    ...typography.summaryBody,
    minHeight: scaleSize(20),
    marginTop: scaleSize(2),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  notificationIdText: {
    ...typography.summaryBody,
    maxWidth: scaleSize(320),
    marginTop: scaleSize(2),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});
