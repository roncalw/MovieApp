/*
Step: 16
   * /MovieApp/src/screens/PopularMoviesScreen.tsx
Imported by:
   * /MovieApp/App.tsx as an alternate legacy screen import
Next step path:
   * /MovieApp/src/components/MovieResultsList.tsx
Purpose:
   * Displays the older popular-movies list flow and remains available as a simpler screen while the newer search-and-detail 
     experience evolves.
*/
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { usePopularMoviesQuery } from '../hooks/queries/useMovieSearchQuery';
import { MovieResultsList } from '../components/MovieResultsList';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';

export function PopularMoviesScreen() {
  /*
    IN THIS PROJECT:
    - PopularMoviesScreen is the current storefront
    - It asks the warehouse request desk (usePopularMoviesQuery) for data

    WHAT COMES BACK:
    - data = the final movieType[] if successful
    - isLoading = whether this screen should show a loading state
    - isError = whether this screen should show an error state
    - error = details for the failed state
  */
  const { data, isLoading, isError, error } = usePopularMoviesQuery();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        {/*
          Lock these screen-owned labels to the shared typography sizes so this
          legacy screen's loading and error text stays aligned with the rest of
          the app across iPhone and Android.
        */}
        <Text allowFontScaling={false} style={styles.message}>
          Loading popular movies...
        </Text>
      </View>
    );
  }

  if (isError) {
    /*
      WHY error instanceof Error IS USED:
      - because the error value is not guaranteed to always be a standard Error object
      - this safely narrows it before reading .message
    */
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={styles.centered}>
        <Text allowFontScaling={false} style={styles.errorText}>
          Error loading movies
        </Text>
        <Text allowFontScaling={false} style={styles.message}>
          {message}
        </Text>
      </View>
    );
  }

  return (
    <MovieResultsList
      movies={data}
      ListHeaderComponent={
        <Text allowFontScaling={false} style={styles.title}>
          Popular Movies
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  /*
    StyleSheet.create organizes this screen's styles in one place.

    IN THIS PROJECT:
    - these styles are only for PopularMoviesScreen
  */
  title: {
    /*
      scaleSize(...) controls the title spacing and fallback screen padding in
      this file so the older screen still follows the same compact-device sizing
      rules as the newer search flow.
    */
    ...typography.pageTitle,
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(8),
    paddingBottom: scaleSize(8),
    color: colors.brandText,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
    backgroundColor: colors.background,
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    textAlign: 'center',
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.feedbackTitle,
    color: colors.brandText,
  },
});
