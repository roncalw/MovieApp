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
