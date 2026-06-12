/**
 * Styles for the custom drawer body and secondary drawer links.
 *
 * Imported by:
 * - src/drawer/AppDrawerContent.tsx
 */
import { Platform, StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';

const drawerLegacyLabelFontFamily = Platform.select({
  android: 'Roboto',
});

export const appDrawerContentStyles = StyleSheet.create({
  drawerRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  drawerScrollContent: {
    paddingTop: 0,
    paddingStart: 0,
    paddingEnd: 0,
    paddingBottom: 0,
  },
  drawerHeader: {
    minHeight: scaleSize(154),
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(50),
    paddingBottom: scaleSize(14),
    justifyContent: 'flex-end',
    backgroundColor: colors.drawerHeaderBackground,
  },
  drawerLogo: {
    width: scaleSize(80),
    height: scaleSize(80),
  },
  drawerHeaderTitle: {
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontFamily: drawerLegacyLabelFontFamily,
    fontWeight: '400',
    letterSpacing: 0,
    marginTop: scaleSize(2),
    color: colors.brandText,
  },
  primaryDrawerItems: {
    paddingTop: scaleSize(10),
  },
  secondaryDrawerItems: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(20),
  },
  secondaryDrawerLink: {
    paddingVertical: scaleSize(15),
    paddingHorizontal: 0,
    borderRadius: scaleSize(6),
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryDrawerLinkFocused: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryDrawerLinkPressed: {
    opacity: 0.7,
  },
  secondaryDrawerLabel: {
    fontFamily: drawerLegacyLabelFontFamily,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(25),
    fontWeight: '400',
    letterSpacing: 0,
    marginLeft: scaleSize(5),
  },
  secondaryDrawerLabelFocused: {
    fontWeight: '400',
  },
});
