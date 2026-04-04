import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { usePopularMoviesQuery } from '../hooks/queries/useMovieSearchQuery';
import type { movieType } from '../types/movie';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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
        <Text style={styles.message}>Loading popular movies...</Text>
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
        <Text style={styles.errorText}>Error loading movies</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      /*
        IN THIS PROJECT:
        - after loading/error early returns, this is the success path
        - FlatList will render the final movieType[] data
      */
      data={data}

      /*
        keyExtractor gives React a stable unique key for each row.

        WHY THIS MATTERS HERE:
        - movieType.id is a number
        - FlatList keys need to be strings
        - so we convert with toString()
      */
      keyExtractor={(item: movieType) => item.id.toString()}

      /*
        contentContainerStyle styles the inner list content.
      */
      contentContainerStyle={styles.listContent}

      /*
        ListHeaderComponent places the title inside the scrollable list.

        WHY THIS IS USEFUL IN THIS PROJECT:
        - cleaner layout on iOS/Android
        - title becomes part of the scrollable content
      */
      ListHeaderComponent={
        <Text style={styles.title}>Popular Movies</Text>
      }

      renderItem={({ item }: { item: movieType }) => (
        <View style={styles.card}>
          {/*
            We only render an Image if poster_path exists.

            WHY:
            - prevents bad/empty image URLs
            - keeps rendering safer for incomplete records
          */}
          {item.poster_path ? (
            <Image
              source={{ uri: `${POSTER_BASE_URL}${item.poster_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : null}

          <Text style={styles.movieTitle}>{item.title}</Text>
          <Text style={styles.subText}>Release Date: {item.release_date}</Text>
          <Text style={styles.subText}>
            Rating: {item.vote_average} ({item.vote_count} votes)
          </Text>
          <Text style={styles.overview}>{item.overview}</Text>
        </View>
      )}
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
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  poster: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  overview: {
    fontSize: 15,
    color: '#333',
    marginTop: 8,
    lineHeight: 21,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'red',
  },
});