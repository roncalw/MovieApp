/*
Step: 4
   * /MovieApp/src/providers/SafeAreaProvider.tsx
Called by:
   * /MovieApp/src/providers/AppProvider.tsx
Next step path:
   * /MovieApp/src/providers/QueryProvider.tsx
Purpose:
   * Wraps the app content in safe-area components so screens stay out of the notch, status bar, and other unsafe device 
     edges.
*/
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
      - SafeAreaView then wraps QueryProvider and the screen content
    */
    <RNSafeAreaProvider>
      {/*
        SafeAreaView is the visible safe-area-aware container.

        IN THIS PROJECT:
        - It wraps QueryProvider right now
        - Later it may wrap your whole navigator

        style={{ flex: 1 }}
        WHY:
        - Makes the safe-area wrapper fill the full screen

        edges={['left', 'right']}
        WHY IN THIS PROJECT:
        - The app should now draw behind the top status area
        - Left and right safe-area protection still help avoid edge clipping
      */}
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
        {children}
      </SafeAreaView>
    </RNSafeAreaProvider>
  );
}
