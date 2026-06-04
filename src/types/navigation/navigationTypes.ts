/**
 * Type definitions for drawer navigation and drawer-only links.
 *
 * React Navigation uses a "param list" to describe every route in a navigator
 * and the parameters each route can receive. Think of it like a menu contract:
 * if a screen is listed here, the app can navigate to it; if a parameter is
 * listed here, TypeScript can verify that callers pass the right shape.
 */

import type { IoniconsIconName } from '@react-native-vector-icons/ionicons/static';

export type AppDrawerParamList = {
  Home: undefined;
  MovieFavorites: undefined;
  IHaveSeen: undefined;
  AdvancedSearch: undefined;
  SearchByMovieTitle:
    | {
        returnTo?: 'Home' | 'AdvancedSearch' | 'MovieFavorites' | 'IHaveSeen';
      }
    | undefined;
  Settings: undefined;
  TellAFriend: undefined;
  PrivacyPolicy: undefined;
};

export type SecondaryDrawerRoute = {
  name: keyof Pick<AppDrawerParamList, 'TellAFriend' | 'PrivacyPolicy'>;
  title: string;
  iconName: IoniconsIconName;
};

export type DrawerIconProps = {
  color: string;
  size: number;
};

export type SecondaryDrawerLinkProps = {
  route: SecondaryDrawerRoute;
  focused: boolean;
  onPress: () => void;
};
