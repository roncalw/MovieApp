import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getHeaderNavTop,
  HEADER_NAV_BUTTON_SIZE,
  HEADER_NAV_HORIZONTAL_OFFSET,
} from './headerNavMetrics';
import type { HeaderActionRowProps } from '../../types/shared/sharedHeaderTypes';

export function HeaderActionRow({
  left,
  center,
  right,
  style,
  leftStyle,
  centerStyle,
  rightStyle,
}: HeaderActionRowProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { top: getHeaderNavTop(insets.top) }, style]}>
      <View style={[styles.sideSlot, styles.leftSlot, leftStyle]}>{left}</View>
      <View style={[styles.centerSlot, centerStyle]}>{center}</View>
      <View style={[styles.sideSlot, styles.rightSlot, rightStyle]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: HEADER_NAV_HORIZONTAL_OFFSET,
    right: HEADER_NAV_HORIZONTAL_OFFSET,
    minHeight: HEADER_NAV_BUTTON_SIZE,
    zIndex: 2,
  },
  sideSlot: {
    position: 'absolute',
    top: 0,
    width: HEADER_NAV_BUTTON_SIZE,
    height: HEADER_NAV_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSlot: {
    left: 0,
  },
  rightSlot: {
    right: 0,
  },
  centerSlot: {
    minHeight: HEADER_NAV_BUTTON_SIZE,
    paddingHorizontal: HEADER_NAV_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
