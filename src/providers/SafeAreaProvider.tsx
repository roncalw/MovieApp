import React, { PropsWithChildren } from 'react';
import {
  SafeAreaProvider as RNSafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

/*
  We alias the package SafeAreaProvider to RNSafeAreaProvider.

  WHY:
  - This file itself exports a function named SafeAreaProvider
  - If we imported SafeAreaProvider with that same name,
    the names would collide inside this file

  SO IN THIS PROJECT:
  - RNSafeAreaProvider = package component
  - SafeAreaProvider = your app wrapper component
*/
export function SafeAreaProvider({ children }: PropsWithChildren) {
  return (
    /*
      RNSafeAreaProvider comes from react-native-safe-area-context.

      WHAT IT DOES:
      - Tracks device safe area information
      - Helps avoid layout issues around the notch / Dynamic Island / status bar

      IN THIS PROJECT:
      - It protects the movie screen layout from being jammed into the top inset area
      - Your earlier iOS issue is exactly why this matters

      WHAT IT WRAPS HERE:
      - It wraps SafeAreaView
      - SafeAreaView then wraps the screen content
    */
    <RNSafeAreaProvider>
      {/*
        SafeAreaView is the visible safe-area-aware container.

        IN THIS PROJECT:
        - It wraps PopularMoviesScreen right now
        - Later it may wrap your whole navigator

        style={{ flex: 1 }}
        WHY:
        - Makes the safe-area wrapper fill the full screen

        edges={['top', 'left', 'right']}
        WHY IN THIS PROJECT:
        - Your current problem area was the top inset on iOS
        - This is a clean starting choice for this screen layout
      */}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </RNSafeAreaProvider>
  );
}