/**
 * Custom drawer body for the app menu.
 *
 * Imported by:
 * - src/navigation/AppNavigator.tsx passes this component to Drawer.Navigator.
 *
 * Code flow:
 * 1. React Navigation renders this component whenever the drawer is opened.
 * 2. The built-in DrawerItemList renders the primary screens configured by
 *    src/navigation/drawerNavigationOptions.tsx.
 * 3. This file renders the custom footer links for sharing the app and opening
 *    the privacy policy.
 */

import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  Share,
  Text,
  View,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { imageAssets } from '../styles/assets';
import { colors } from '../styles/colors';
import { scaleSize } from '../styles/scale';
import { appDrawerContentStyles as styles } from '../styles/drawer/appDrawerContentStyles';
import type {
  SecondaryDrawerLinkProps,
  SecondaryDrawerRoute,
} from '../types/navigation/navigationTypes';

const androidStoreUrl =
  'https://play.google.com/store/apps/details?id=com.codefest.movieapp';
const iosStoreUrl = 'https://apps.apple.com/us/app/movie-guider/id6465793035';

const secondaryDrawerRoutes: SecondaryDrawerRoute[] = [
  {
    name: 'TellAFriend',
    title: 'Tell a Friend',
    iconName: 'share-social-outline',
  },
  {
    name: 'PrivacyPolicy',
    title: 'Privacy Policy',
    iconName: 'shield-checkmark-outline',
  },
];

function getFocusedRouteName(props: DrawerContentComponentProps) {
  return props.state.routeNames[props.state.index];
}

function SecondaryDrawerLink({
  route,
  focused,
  onPress,
}: SecondaryDrawerLinkProps) {
  const iconColor = focused
    ? colors.drawerSecondaryActiveIcon
    : colors.drawerSecondaryInactiveIcon;
  const textColor = focused
    ? colors.drawerSecondaryActiveText
    : colors.drawerSecondaryInactiveText;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryDrawerLink,
        focused ? styles.secondaryDrawerLinkFocused : null,
        pressed ? styles.secondaryDrawerLinkPressed : null,
      ]}
    >
      <Ionicons
        name={route.iconName}
        color={iconColor}
        size={scaleSize(22)}
      />
      <Text
        allowFontScaling={false}
        style={[
          styles.secondaryDrawerLabel,
          { color: textColor },
          focused ? styles.secondaryDrawerLabelFocused : null,
        ]}
      >
        {route.title}
      </Text>
    </Pressable>
  );
}

async function shareWithFriend() {
  try {
    const storeUrl = Platform.OS === 'android' ? androidStoreUrl : iosStoreUrl;
    const contentToShare =
      Platform.OS === 'android'
        ? {
            message:
              'Check out this Movie app!\n\nWith this movie guide you can find out what movies are playing and where they are streaming or where they are for rent as well!\n\nClick on the link below to download it!\n\nhttps://play.google.com/store/apps/details?id=com.codefest.movieapp',
          }
        : {
            title: 'Check out this Movie app!',
            message:
              'With this movie guide you can find out what movies are playing and where they are streaming or where they are for rent as well!\n\nClick on the link below to download it!',
            url: storeUrl,
          };

    const result = await Share.share(contentToShare);

    if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error sharing:', err.message);
  }
}

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const focusedRouteName = getFocusedRouteName(props);

  return (
    <View style={styles.drawerRoot}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerScrollContent}
      >
        <View style={styles.drawerHeader}>
          <Image
            source={imageAssets.cinemaMenu}
            style={styles.drawerLogo}
            resizeMode="contain"
          />
          <Text allowFontScaling={false} style={styles.drawerHeaderTitle}>
            It's Movie Time
          </Text>
        </View>

        <View style={styles.primaryDrawerItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.secondaryDrawerItems}>
        {secondaryDrawerRoutes.map(route => (
          <SecondaryDrawerLink
            key={route.name}
            route={route}
            focused={focusedRouteName === route.name}
            onPress={() => {
              if (route.name === 'TellAFriend') {
                shareWithFriend();
                return;
              }

              props.navigation.navigate(route.name);
            }}
          />
        ))}
      </View>
    </View>
  );
}
