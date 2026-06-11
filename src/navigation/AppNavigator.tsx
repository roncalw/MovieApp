import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { MovieSearchScreen } from '../search/advanced/MovieSearchScreen';
import { HomeScreen } from '../home/HomeScreen';
import { MovieFavoritesScreen } from '../drawer/MovieFavoritesScreen';
import { MovieSeenScreen } from '../drawer/MovieSeenScreen';
import { SearchByMovieTitleScreen } from '../search/title/SearchByMovieTitleScreen';
import { SettingsScreen } from '../drawer/SettingsScreen';
import { TellAFriendScreen } from '../drawer/TellAFriendScreen';
import { PrivacyPolicyScreen } from '../drawer/PrivacyPolicyScreen';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import type {
  AppDrawerParamList,
  DrawerIconProps,
  SecondaryDrawerLinkProps,
  SecondaryDrawerRoute,
} from '../types/navigation/navigationTypes';

const Drawer = createDrawerNavigator<AppDrawerParamList>();
const cinemaMenuIcon = require('../assets/images/cinema_menu.jpg');
const drawerActiveTintColor = colors.brandText;
const drawerInactiveTintColor = colors.brandText;
const drawerInactiveIconColor = 'rgb(180, 58, 58)';
const secondaryDrawerIconColor = 'rgb(180, 29, 29)';
const secondaryDrawerTextColor = 'rgb(127, 29, 29)';
const androidStoreUrl =
  'https://play.google.com/store/apps/details?id=com.codefest.movieapp';
const iosStoreUrl = 'https://apps.apple.com/us/app/movie-guider/id6465793035';
const drawerLegacyLabelFontFamily = Platform.select({
  android: 'Roboto',
});

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

function getDrawerIconColor(focused: boolean) {
  return focused ? drawerActiveTintColor : drawerInactiveIconColor;
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

function SecondaryDrawerLink({
  route,
  focused,
  onPress,
}: SecondaryDrawerLinkProps) {
  const contentColor = secondaryDrawerTextColor;

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
        color={secondaryDrawerIconColor}
        size={scaleSize(22)}
      />
      <Text
        allowFontScaling={false}
        style={[
          styles.secondaryDrawerLabel,
          { color: contentColor },
          styles.secondaryDrawerLabelFocused,
        ]}
      >
        {route.title}
      </Text>
    </Pressable>
  );
}

function AppDrawerContent(props: DrawerContentComponentProps) {
  const focusedRouteName = getFocusedRouteName(props);

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

  return (
    <View style={styles.drawerRoot}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerScrollContent}
      >
        <View style={styles.drawerHeader}>
          <Image
            source={cinemaMenuIcon}
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

function renderDrawerContent(props: DrawerContentComponentProps) {
  return <AppDrawerContent {...props} />;
}

const homeDrawerOptions = {
  title: 'Home',
  drawerLabel: makePrimaryDrawerLabel('Home'),
  drawerIcon: HomeDrawerIcon,
};

const movieFavoritesDrawerOptions = {
  title: 'My Movie Favorites',
  drawerLabel: makePrimaryDrawerLabel('My Movie Favorites'),
  drawerIcon: FavoritesDrawerIcon,
};

const movieSeenDrawerOptions = {
  title: 'Movies I Have Seen',
  drawerLabel: makePrimaryDrawerLabel('Movies I Have Seen'),
  drawerIcon: SeenDrawerIcon,
};

const advancedSearchDrawerOptions = {
  title: 'Advanced Search',
  drawerLabel: makePrimaryDrawerLabel('Advanced Search'),
  drawerIcon: SearchDrawerIcon,
};

const settingsDrawerOptions = {
  title: 'Settings',
  drawerLabel: makePrimaryDrawerLabel('Settings'),
  drawerIcon: SettingsDrawerIcon,
};

function getTellAFriendDrawerOptions() {
  return {
    title: 'Tell a Friend',
    drawerItemStyle: styles.hiddenDrawerItem,
  };
}

function getPrivacyPolicyDrawerOptions() {
  return {
    title: 'Privacy Policy',
    drawerItemStyle: styles.hiddenDrawerItem,
  };
}

function getSearchByMovieTitleDrawerOptions() {
  return {
    title: 'Search by Movie Title',
    drawerItemStyle: styles.hiddenDrawerItem,
  };
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={renderDrawerContent}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: '#EEEEEE',
          drawerActiveTintColor,
          drawerInactiveTintColor,
          drawerLabelStyle: styles.drawerLabel,
          drawerStyle: styles.drawer,
          drawerItemStyle: styles.drawerItem,
          sceneStyle: styles.scene,
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={homeDrawerOptions}
        />
        <Drawer.Screen
          name="MovieFavorites"
          component={MovieFavoritesScreen}
          options={movieFavoritesDrawerOptions}
        />
        <Drawer.Screen
          name="IHaveSeen"
          component={MovieSeenScreen}
          options={movieSeenDrawerOptions}
        />
        <Drawer.Screen
          name="AdvancedSearch"
          component={MovieSearchScreen}
          options={advancedSearchDrawerOptions}
        />
        <Drawer.Screen
          name="SearchByMovieTitle"
          component={SearchByMovieTitleScreen}
          options={getSearchByMovieTitleDrawerOptions}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={settingsDrawerOptions}
        />
        <Drawer.Screen
          name="TellAFriend"
          component={TellAFriendScreen}
          options={getTellAFriendDrawerOptions}
        />
        <Drawer.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={getPrivacyPolicyDrawerOptions}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.background,
  },
  drawer: {
    width: '76%',
    backgroundColor: colors.background,
  },
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
    backgroundColor: '#A6A6A6',
  },
  drawerLogo: {
    width: scaleSize(80),
    height: scaleSize(80),
  },
  drawerHeaderTitle: {
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontFamily: drawerLegacyLabelFontFamily,
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '500',
  },
  hiddenDrawerItem: {
    display: 'none',
  },
});
