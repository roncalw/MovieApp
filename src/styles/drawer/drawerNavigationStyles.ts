/**
 * Styles and constants for React Navigation drawer options.
 *
 * Imported by:
 * - src/navigation/drawerNavigationOptions.tsx
 */
import { Platform, StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';

const drawerLegacyLabelFontFamily = Platform.select({
  android: 'Roboto',
});

export const drawerNavigationColors = {
  activeTint: colors.drawerActiveText,
  inactiveTint: colors.drawerInactiveText,
  activeIcon: colors.drawerActiveIcon,
  inactiveIcon: colors.drawerInactiveIcon,
  activeBackground: colors.drawerActiveBackground,
} as const;

export const drawerNavigationStyles = StyleSheet.create({
  scene: {
    backgroundColor: colors.background,
  },
  drawer: {
    width: '76%',
    backgroundColor: colors.background,
  },
  drawerItem: {
    borderRadius: scaleSize(6),
    marginHorizontal: scaleSize(10),
    marginVertical: scaleSize(4),
  },
  drawerLabel: {
    fontFamily: drawerLegacyLabelFontFamily,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(25),
    fontWeight: '400',
    height: scaleSize(25),
    letterSpacing: 0,
  },
  drawerLabelFocused: {
    fontWeight: '400',
  },
  hiddenDrawerItem: {
    display: 'none',
  },
});
