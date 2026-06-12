/**
 * Drawer route labels, icons, and navigator-level style options.
 *
 * Imported by:
 * - src/navigation/AppNavigator.tsx uses these exports while declaring screens.
 *
 * Code flow:
 * 1. AppNavigator declares the drawer screens.
 * 2. React Navigation reads these option objects to decide each route title,
 *    label text, icon, and whether the route appears in the visible drawer list.
 * 3. src/drawer/AppDrawerContent.tsx renders the final drawer UI.
 */

import React from 'react';
import { Text } from 'react-native';
import type { DrawerNavigationOptions } from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import {
  drawerNavigationColors,
  drawerNavigationStyles as styles,
} from '../styles/drawer/drawerNavigationStyles';
import type { DrawerIconProps } from '../types/navigation/navigationTypes';

function getDrawerIconColor(focused: boolean) {
  return focused
    ? drawerNavigationColors.activeIcon
    : drawerNavigationColors.inactiveIcon;
}

function HomeDrawerIcon({ focused, size }: DrawerIconProps) {
  return <Ionicons name="home" color={getDrawerIconColor(focused)} size={size} />;
}

function FavoritesDrawerIcon({ focused, size }: DrawerIconProps) {
  return <Ionicons name="heart" color={getDrawerIconColor(focused)} size={size} />;
}

function SeenDrawerIcon({ focused, size }: DrawerIconProps) {
  return (
    <Ionicons
      name="checkmark-circle"
      color={getDrawerIconColor(focused)}
      size={size}
    />
  );
}

function SearchDrawerIcon({ focused, size }: DrawerIconProps) {
  return <Ionicons name="search" color={getDrawerIconColor(focused)} size={size} />;
}

function SettingsDrawerIcon({ focused, size }: DrawerIconProps) {
  return (
    <Ionicons name="settings" color={getDrawerIconColor(focused)} size={size} />
  );
}

function makePrimaryDrawerLabel(label: string) {
  return function PrimaryDrawerLabel({
    focused,
    color,
  }: {
    focused: boolean;
    color: string;
  }) {
    return (
      <Text
        allowFontScaling={false}
        style={[
          styles.drawerLabel,
          { color },
          focused ? styles.drawerLabelFocused : null,
        ]}
      >
        {label}
      </Text>
    );
  };
}

export const drawerScreenOptions: DrawerNavigationOptions = {
  headerShown: false,
  drawerActiveBackgroundColor: drawerNavigationColors.activeBackground,
  drawerActiveTintColor: drawerNavigationColors.activeTint,
  drawerInactiveTintColor: drawerNavigationColors.inactiveTint,
  drawerLabelStyle: styles.drawerLabel,
  drawerStyle: styles.drawer,
  drawerItemStyle: styles.drawerItem,
  sceneStyle: styles.scene,
};

export const homeDrawerOptions = {
  title: 'Home',
  drawerLabel: makePrimaryDrawerLabel('Home'),
  drawerIcon: HomeDrawerIcon,
};

export const movieFavoritesDrawerOptions = {
  title: 'My Movie Favorites',
  drawerLabel: makePrimaryDrawerLabel('My Movie Favorites'),
  drawerIcon: FavoritesDrawerIcon,
};

export const movieSeenDrawerOptions = {
  title: 'Movies I Have Seen',
  drawerLabel: makePrimaryDrawerLabel('Movies I Have Seen'),
  drawerIcon: SeenDrawerIcon,
};

export const advancedSearchDrawerOptions = {
  title: 'Advanced Search',
  drawerLabel: makePrimaryDrawerLabel('Advanced Search'),
  drawerIcon: SearchDrawerIcon,
};

export const settingsDrawerOptions = {
  title: 'Settings',
  drawerLabel: makePrimaryDrawerLabel('Settings'),
  drawerIcon: SettingsDrawerIcon,
};

export const tellAFriendDrawerOptions = {
  title: 'Tell a Friend',
  drawerItemStyle: styles.hiddenDrawerItem,
};

export const privacyPolicyDrawerOptions = {
  title: 'Privacy Policy',
  drawerItemStyle: styles.hiddenDrawerItem,
};

export const searchByMovieTitleDrawerOptions = {
  title: 'Search by Movie Title',
  drawerItemStyle: styles.hiddenDrawerItem,
};
