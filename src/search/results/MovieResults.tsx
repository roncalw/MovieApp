/*
Step: 8
   * /MovieApp/src/search/results/MovieResults.tsx
Imported by:
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
   * /MovieApp/src/search/title/SearchByMovieTitleScreen.tsx
   * /MovieApp/src/drawer/StoredMovieListScreen.tsx
Next step path:
   * /MovieApp/src/movie/MovieDetail.tsx
Purpose:
   * Renders a reusable movie list, supports optional infinite scrolling, and lets the parent decide what should happen when a
     card is tapped.
*/
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import type { movieType } from '../../types/movie/MovieTypes';
import { MovieCard } from './MovieCard';
import { scaleSize } from '../../theme/scale';
import { colors } from '../../theme/colors';
import type { MovieResultsProps } from '../../types/search/movieResultsTypes';

export function MovieResults({
  movies,
  ListHeaderComponent,
  ListHeaderComponentStyle,
  ListEmptyComponent,
  cardVariant = 'summary',
  showRatingBadge = true,
  imageRefreshGeneration,
  onMoviePress,
  onRefresh,
  refreshing,
  onStartShouldSetResponderCapture,
  onTouchMove,
  onTouchEnd,
  onScroll,
  onEndReached,
  hasNextPage = false,
  isFetchingNextPage = false,
}: MovieResultsProps) {
  const listRef = useRef<FlatList<movieType> | null>(null);
  const isDraggingRef = useRef(false);
  const refreshIsWaitingForReleaseRef = useRef(false);
  const [refreshIsWaitingForRelease, setRefreshIsWaitingForRelease] =
    useState(false);
  const isPosterGrid = cardVariant === 'posterRating';

  /*
   * iPhone can call the native list's onRefresh callback as soon as the pull
   * crosses its activation threshold, even though the person's finger is still
   * holding the list down. Android normally calls it after release. This
   * component preserves each platform's release signal while presenting the
   * same behavior to the person using the app.
   *
   * Crossing the threshold may keep the native indicator active, but on iPhone
   * FlatList supplies onScrollEndDrag at the actual finger release,
   * so an early iPhone refresh request waits for that event. Android's native
   * SwipeRefreshLayout already emits onRefresh after ACTION_UP; it does not emit
   * a matching ScrollView drag-end event for this overscroll. Calling Android's
   * already-release-gated callback directly therefore produces the same user
   * behavior without leaving its refresh permanently pending.
   *
   * Consequently, neither platform clears cached pages or starts the HTTP
   * request during the held portion of the gesture.
   */
  const handleScrollBeginDrag = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleNativeRefreshRequest = useCallback(() => {
    if (!onRefresh) {
      return;
    }

    if (Platform.OS === 'ios' && isDraggingRef.current) {
      refreshIsWaitingForReleaseRef.current = true;
      setRefreshIsWaitingForRelease(true);
      return;
    }

    onRefresh();
  }, [onRefresh]);

  const handleDragRelease = useCallback(() => {
    isDraggingRef.current = false;

    if (!refreshIsWaitingForReleaseRef.current) {
      return;
    }

    refreshIsWaitingForReleaseRef.current = false;
    onRefresh?.();
    setRefreshIsWaitingForRelease(false);
  }, [onRefresh]);

  const isRefreshIndicatorVisible =
    Boolean(refreshing) || refreshIsWaitingForRelease;

  return (
    <View
      style={styles.container}
      onStartShouldSetResponderCapture={onStartShouldSetResponderCapture}
    >
      <FlatList
        testID="movie-results-list"
        key={isPosterGrid ? 'poster-grid' : 'summary-list'}
        ref={listRef}
        alwaysBounceVertical
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onRefresh={onRefresh ? handleNativeRefreshRequest : undefined}
        refreshing={onRefresh ? isRefreshIndicatorVisible : undefined}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleDragRelease}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onScroll={onScroll}
        data={movies}
        numColumns={isPosterGrid ? 3 : 1}
        keyExtractor={(item: movieType) => item.id.toString()}
        columnWrapperStyle={isPosterGrid ? styles.posterGridRow : undefined}
        contentContainerStyle={[
          styles.listContent,
          isPosterGrid ? styles.posterGridContent : null,
        ]}
        ListHeaderComponent={ListHeaderComponent}
        ListHeaderComponentStyle={ListHeaderComponentStyle}
        ListEmptyComponent={ListEmptyComponent}
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
              showRatingBadge={showRatingBadge}
              imageRefreshGeneration={imageRefreshGeneration}
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
      {isRefreshIndicatorVisible ? (
        <View
          pointerEvents="none"
          style={styles.refreshingIndicator}
          accessibilityRole="progressbar"
          accessibilityLabel="Refreshing search results"
        >
          <ActivityIndicator size="large" color={colors.brandText} />
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
  posterGridContent: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(24),
    paddingBottom: scaleSize(24),
  },
  posterGridRow: {
    columnGap: scaleSize(10),
  },
  posterGridItem: {
    flex: 1,
    maxWidth: '31.8%',
    marginBottom: scaleSize(18),
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  refreshingIndicator: {
    position: 'absolute',
    top: scaleSize(54),
    alignSelf: 'center',
    zIndex: 10,
    padding: scaleSize(10),
    borderRadius: scaleSize(28),
    backgroundColor: colors.surfaceWhite,
    shadowColor: colors.movieShadow,
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.25,
    shadowRadius: scaleSize(4),
    elevation: 5,
  },
});
