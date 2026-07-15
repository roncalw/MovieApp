import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MovieSearchScreen } from '../search/advanced/MovieSearchScreen';
import { HomeScreen } from '../home/HomeScreen';
import { MovieFavoritesScreen } from '../drawer/MovieFavoritesScreen';
import { MovieSeenScreen } from '../drawer/MovieSeenScreen';
import { SearchByMovieTitleScreen } from '../search/title/SearchByMovieTitleScreen';
import { SettingsScreen } from '../drawer/SettingsScreen';
import { TellAFriendScreen } from '../drawer/TellAFriendScreen';
import { PrivacyPolicyScreen } from '../drawer/PrivacyPolicyScreen';
import { AppDrawerContent } from '../drawer/AppDrawerContent';
import {
  SearchPageResetCoordinatorProvider,
  useSearchPageResetCoordinator,
} from '../search/shared/SearchPageResetCoordinator';
import { MovieDetailScreen, PersonDetailScreen } from './DetailScreens';
import {
  advancedSearchDrawerOptions,
  drawerScreenOptions,
  homeDrawerOptions,
  movieFavoritesDrawerOptions,
  movieSeenDrawerOptions,
  privacyPolicyDrawerOptions,
  searchByMovieTitleDrawerOptions,
  settingsDrawerOptions,
  tellAFriendDrawerOptions,
} from './drawerNavigationOptions';
import type {
  AppDrawerParamList,
  AppRootStackParamList,
} from '../types/navigation/navigationTypes';

const Drawer = createDrawerNavigator<AppDrawerParamList>();
const RootStack = createNativeStackNavigator<AppRootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        id="AppRootStack"
        initialRouteName="DrawerRoot"
        screenOptions={{
          animation: 'slide_from_right',
          headerShown: false,
        }}
      >
        <RootStack.Screen name="DrawerRoot" component={AppDrawerNavigator} />
        <RootStack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <RootStack.Screen name="PersonDetail" component={PersonDetailScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function AppDrawerNavigator() {
  return (
    <SearchPageResetCoordinatorProvider>
      <AppDrawerNavigatorContent />
    </SearchPageResetCoordinatorProvider>
  );
}

function AppDrawerNavigatorContent() {
  const { resetSearchPageForDrawerNavigation } =
    useSearchPageResetCoordinator();

  return (
    <Drawer.Navigator
      drawerContent={props => <AppDrawerContent {...props} />}
      screenListeners={({ navigation, route }) => ({
        drawerItemPress: () => {
          const drawerState = navigation.getState();
          const currentRouteName = drawerState.routes[drawerState.index]?.name;

          resetSearchPageForDrawerNavigation(currentRouteName, route.name);
        },
      })}
      screenOptions={drawerScreenOptions}
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
        options={searchByMovieTitleDrawerOptions}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={settingsDrawerOptions}
      />
      <Drawer.Screen
        name="TellAFriend"
        component={TellAFriendScreen}
        options={tellAFriendDrawerOptions}
      />
      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={privacyPolicyDrawerOptions}
      />
    </Drawer.Navigator>
  );
}
