import React, { PropsWithChildren } from 'react';
import { QueryProvider } from './QueryProvider';
import { SafeAreaProvider } from './SafeAreaProvider';

export function AppProvider({ children }: PropsWithChildren) {
  return (
    /*
      AppProvider is the composition root for app-wide providers.

      WHAT THAT MEANS IN THIS PROJECT:
      - This is where you stack the provider layers your app needs
      - Right now that means:
          1. QueryProvider
          2. SafeAreaProvider

      WHY THIS FILE EXISTS:
      - So App.tsx stays small
      - So provider setup is centralized
      - So when navigation is added next, App.tsx does not become cluttered

      WHAT children IS HERE:
      - In App.tsx, AppProvider wraps PopularMoviesScreen

        <AppProvider>
          <PopularMoviesScreen />
        </AppProvider>

      So in THIS project, children = <PopularMoviesScreen />

      WHAT HAPPENS TO THAT CHILD:
      - AppProvider passes that child into QueryProvider
      - QueryProvider passes it into QueryClientProvider
      - SafeAreaProvider also wraps that same child

      SO AppProvider is saying:
      - "Take whatever visible part of the app I wrap,
         and place it inside the building systems"

      LATER IN THIS PROJECT:
      - children will probably change from PopularMoviesScreen
      - to AppNavigator

      ANALOGY:
      - This is the main utility Provider  room of the building
      - It turns on the systems the storefront depends on
    */
    <QueryProvider>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryProvider>
  );
}