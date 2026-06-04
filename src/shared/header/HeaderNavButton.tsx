import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { colors } from '../../theme/colors';
import {
  getHeaderNavTop,
  HEADER_NAV_BACK_ICON_SIZE,
  HEADER_NAV_BUTTON_SIZE,
  HEADER_NAV_HORIZONTAL_OFFSET,
  HEADER_NAV_ICON_SIZE,
  HEADER_NAV_IMAGE_SIZE,
} from './headerNavMetrics';
import type {
  HeaderNavButtonProps,
  HeaderNavButtonVariant,
} from '../../types/shared/sharedHeaderTypes';

const cinemaMenuIcon = require('../../assets/images/cinema_menu.jpg');

function getDefaultAccessibilityLabel(variant: HeaderNavButtonVariant) {
  if (variant === 'back') {
    return 'Go back';
  }

  if (variant === 'search') {
    return 'Search by movie title';
  }

  return 'Open navigation menu';
}

export function HeaderNavButton({
  variant,
  onPress,
  edge = 'left',
  anchored = true,
  color = colors.textPrimary,
  accessibilityLabel,
  buttonStyle,
  imageStyle,
}: HeaderNavButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        anchored ? styles.anchoredButton : null,
        anchored
          ? edge === 'left'
            ? styles.leftButton
            : styles.rightButton
          : null,
        anchored ? { top: getHeaderNavTop(insets.top) } : null,
        buttonStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? getDefaultAccessibilityLabel(variant)
      }
    >
      {variant === 'menu' ? (
        <Image
          source={cinemaMenuIcon}
          style={[styles.menuImage, imageStyle]}
          resizeMode="contain"
        />
      ) : (
        <Ionicons
          name={variant === 'back' ? 'chevron-back' : 'search-outline'}
          size={
            variant === 'back' ? HEADER_NAV_BACK_ICON_SIZE : HEADER_NAV_ICON_SIZE
          }
          color={color}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: HEADER_NAV_BUTTON_SIZE,
    height: HEADER_NAV_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchoredButton: {
    position: 'absolute',
    zIndex: 2,
  },
  leftButton: {
    left: HEADER_NAV_HORIZONTAL_OFFSET,
  },
  rightButton: {
    right: HEADER_NAV_HORIZONTAL_OFFSET,
  },
  menuImage: {
    width: HEADER_NAV_IMAGE_SIZE,
    height: HEADER_NAV_IMAGE_SIZE,
  },
});
