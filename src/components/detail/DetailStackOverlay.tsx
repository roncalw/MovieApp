import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PersonDetail } from '../../screens/PersonDetail';
import { MovieDetail } from '../../screens/MovieDetail';
import { colors } from '../../theme/colors';
import type { movieType } from '../../types/MovieTypes';
import type { DetailStackEntry } from '../../navigation/detailStackTypes';

type DetailStackOverlayProps = {
  detailStack: DetailStackEntry[];
  onPopDetail: () => void;
  onCloseAllDetails: () => void;
  onBackToOriginalMovie: () => void;
  onPushMovie: (movie: movieType) => void;
  onPushPerson: (personId: number, initialPersonName?: string) => void;
};

export function DetailStackOverlay({
  detailStack,
  onPopDetail,
  onCloseAllDetails,
  onBackToOriginalMovie,
  onPushMovie,
  onPushPerson,
}: DetailStackOverlayProps) {
  const activeEntry = detailStack[detailStack.length - 1];

  if (!activeEntry) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      {activeEntry.type === 'movie' ? (
        <MovieDetail
          movieId={activeEntry.movieId}
          initialMovie={activeEntry.initialMovie}
          stackDepth={detailStack.length}
          onBackPress={onPopDetail}
          onCloseAllPress={onCloseAllDetails}
          onBackToOriginalMoviePress={onBackToOriginalMovie}
          onPersonPress={onPushPerson}
        />
      ) : (
        <PersonDetail
          personId={activeEntry.personId}
          initialPersonName={activeEntry.initialPersonName}
          stackDepth={detailStack.length}
          onBackPress={onPopDetail}
          onCloseAllPress={onCloseAllDetails}
          onBackToOriginalMoviePress={onBackToOriginalMovie}
          onMoviePress={onPushMovie}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: colors.background,
  },
});
