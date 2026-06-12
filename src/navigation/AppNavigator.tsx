import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
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
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <AppDrawerContent {...props} />}
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
    </NavigationContainer>
  );
}
