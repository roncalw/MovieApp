/**
 * Type definitions for the shared header controls.
 *
 * These types describe the reusable header row used across Home, Search,
 * Favorites, Seen, Settings, and back-button pages. The "props" word means the
 * input settings passed into a component. In this case, the props decide what
 * appears in the left, center, and right header slots and which icon behavior a
 * header button should use.
 */

import type React from 'react';
import type {
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type HeaderActionRowProps = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  leftStyle?: StyleProp<ViewStyle>;
  centerStyle?: StyleProp<ViewStyle>;
  rightStyle?: StyleProp<ViewStyle>;
};

export type HeaderNavButtonVariant = 'menu' | 'back' | 'search';

export type HeaderNavButtonProps = {
  variant: HeaderNavButtonVariant;
  onPress: () => void;
  edge?: 'left' | 'right';
  anchored?: boolean;
  color?: string;
  accessibilityLabel?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};
