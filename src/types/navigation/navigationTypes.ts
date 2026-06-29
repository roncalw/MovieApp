/**
 * Type definitions for drawer navigation and drawer-only links.
 *
 * React Navigation uses a "param list" to describe every route in a navigator
 * and the parameters each route can receive. Think of it like a menu contract:
 * if a screen is listed here, the app can navigate to it; if a parameter is
 * listed here, TypeScript can verify that callers pass the right shape.
 */

import type { IoniconsIconName } from '@react-native-vector-icons/ionicons/static';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { movieType } from '../movie/MovieTypes';

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

/**
 * Routes owned by the root native stack.
 *
 * The drawer is one native-stack screen. Movie and person details are separate
 * native-stack screens above it, so opening details no longer forces the Home,
 * Search, Favorites, or Seen screen to redraw itself as an overlay host.
 */
export type AppRootStackParamList = {
  DrawerRoot: NavigatorScreenParams<AppDrawerParamList> | undefined;
  MovieDetail: {
    movieId: number;
    initialMovie?: movieType | null;
  };
  PersonDetail: {
    personId: number;
    initialPersonName?: string;
  };
};

export type SecondaryDrawerRoute = {
  name: keyof Pick<AppDrawerParamList, 'TellAFriend' | 'PrivacyPolicy'>;
  title: string;
  iconName: IoniconsIconName;
};

export type DrawerIconProps = {
  color: string;
  focused: boolean;
  size: number;
};

export type SecondaryDrawerLinkProps = {
  route: SecondaryDrawerRoute;
  focused: boolean;
  onPress: () => void;
};
