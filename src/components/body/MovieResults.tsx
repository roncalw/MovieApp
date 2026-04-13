/*
Step: 8
   * /MovieApp/src/components/body/MovieResults.tsx
Imported by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
   * /MovieApp/src/screens/PopularMoviesScreen.tsx
Next step path:
   * /MovieApp/src/screens/MovieDetail.tsx
Purpose:
   * Renders a reusable movie list, supports optional infinite scrolling, and opens the shared movie detail screen when a card
     is tapped.
*/
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import type { movieType } from '../../types/MovieTypes';
import { MovieCard } from '../ui/MovieCard';
import { MovieDetail } from '../../screens/MovieDetail';

type MovieResultsProps = {
  movies: movieType[] | undefined;
  ListHeaderComponent?: React.ReactElement | null;
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};

export function MovieResults({
  movies,
  ListHeaderComponent,
  onEndReached,
  hasNextPage = false,
  isFetchingNextPage = false,
}: MovieResultsProps) {
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const listRef = useRef<FlatList<movieType> | null>(null);

  const selectedMovieFromList = useMemo(
    () => movies?.find((movie) => movie.id === selectedMovieId) ?? null,
    [movies, selectedMovieId]
  );

  function handleOpenMovie(movieId: number) {
    setSelectedMovieId(movieId);
  }

  function handleBackFromMovie() {
    setSelectedMovieId(null);
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={movies}
        keyExtractor={(item: movieType) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            onEndReached?.();
          }
        }}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        renderItem={({ item }: { item: movieType }) => (
          <MovieCard
            movie={item}
            onPress={() => handleOpenMovie(item.id)}
          />
        )}
      />

      {selectedMovieId !== null ? (
        <View style={styles.detailOverlay}>
          <MovieDetail
            movieId={selectedMovieId}
            initialMovie={selectedMovieFromList}
            onBack={handleBackFromMovie}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
