/*
Step: 8
   * /MovieApp/src/components/body/MovieResults.tsx
Imported by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
   * /MovieApp/src/screens/PopularMoviesScreen.tsx
Next step path:
   * /MovieApp/src/screens/MovieDetail.tsx
Purpose:
   * Renders a reusable movie list, supports optional infinite scrolling, and lets the parent decide what should happen when a
     card is tapped.
*/
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import type { movieType } from '../../types/MovieTypes';
import { MovieCard } from '../ui/MovieCard';
import { scaleSize } from '../../theme/scale';

type MovieResultsProps = {
  movies: movieType[] | undefined;
  ListHeaderComponent?: React.ReactElement | null;
  cardVariant?: 'summary' | 'posterRating';
  onMoviePress?: (movie: movieType) => void;
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};

export function MovieResults({
  movies,
  ListHeaderComponent,
  cardVariant = 'summary',
  onMoviePress,
  onEndReached,
  hasNextPage = false,
  isFetchingNextPage = false,
}: MovieResultsProps) {
  const listRef = useRef<FlatList<movieType> | null>(null);
  const isPosterGrid = cardVariant === 'posterRating';

  return (
    <View style={styles.container}>
      <FlatList
        key={isPosterGrid ? 'poster-grid' : 'summary-list'}
        ref={listRef}
        data={movies}
        numColumns={isPosterGrid ? 3 : 1}
        keyExtractor={(item: movieType) => item.id.toString()}
        columnWrapperStyle={isPosterGrid ? styles.posterGridRow : undefined}
        contentContainerStyle={[
          styles.listContent,
          isPosterGrid ? styles.posterGridContent : null,
        ]}
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
        renderItem={({ item }: { item: movieType }) => {
          const card = (
            <MovieCard
              movie={item}
              variant={cardVariant}
              onPress={() => onMoviePress?.(item)}
            />
          );

          return isPosterGrid ? (
            <View style={styles.posterGridItem}>{card}</View>
          ) : (
            card
          );
        }}
      />
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
  posterGridContent: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(16),
  },
  posterGridRow: {
    columnGap: scaleSize(10),
  },
  posterGridItem: {
    flex: 1,
    maxWidth: '31.8%',
    marginBottom: scaleSize(10),
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
