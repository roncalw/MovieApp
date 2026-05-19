/*
Step: Drawer menu image button
   * /MovieApp/src/components/navigation/DrawerMenuButton.tsx
Imported by:
   * /MovieApp/src/components/header/SubHeaderTop.tsx
   * /MovieApp/src/screens/HomeScreen.tsx
Purpose:
   * Keeps the legacy cinema-logo drawer button in one place so the Home hero and Advanced Search header open the drawer with
     the same image, sizing defaults, and accessibility label.
*/
import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { scaleSize } from '../../theme/scale';

const cinemaMenuIcon = require('../../assets/images/cinema_menu.jpg');

type DrawerMenuButtonProps = {
  onPress: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function DrawerMenuButton({
  onPress,
  buttonStyle,
  imageStyle,
}: DrawerMenuButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, buttonStyle]}
      accessibilityRole="button"
      accessibilityLabel="Open navigation menu"
    >
      <Image
        source={cinemaMenuIcon}
        style={[styles.image, imageStyle]}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: scaleSize(56),
    minHeight: scaleSize(56),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  image: {
    width: scaleSize(48),
    height: scaleSize(48),
  },
});
