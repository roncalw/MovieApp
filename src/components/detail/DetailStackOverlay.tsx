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
  onPushMovie: (movie: movieType) => void;
  onPushPerson: (personId: number, initialPersonName?: string) => void;
};

export function DetailStackOverlay({
  detailStack,
  onPopDetail,
  onCloseAllDetails,
  onPushMovie,
  onPushPerson,
}: DetailStackOverlayProps) {
  if (detailStack.length === 0) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      {detailStack.map((entry, index) => {
        const isTopEntry = index === detailStack.length - 1;
        const layerStyle = [
          styles.layer,
          isTopEntry ? null : styles.hiddenLayer,
        ];

        return (
          <View
            key={getDetailStackEntryKey(entry, index)}
            style={layerStyle}
            pointerEvents={isTopEntry ? 'auto' : 'none'}
            accessibilityElementsHidden={!isTopEntry}
            importantForAccessibility={isTopEntry ? 'auto' : 'no-hide-descendants'}
          >
            {entry.type === 'movie' ? (
              <MovieDetail
                movieId={entry.movieId}
                initialMovie={entry.initialMovie}
                onBackPress={onPopDetail}
                onPersonPress={onPushPerson}
              />
            ) : (
              <PersonDetail
                personId={entry.personId}
                initialPersonName={entry.initialPersonName}
                onBackPress={onPopDetail}
                onCloseAllPress={onCloseAllDetails}
                onMoviePress={onPushMovie}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function getDetailStackEntryKey(entry: DetailStackEntry, index: number) {
  return entry.type === 'movie'
    ? `movie-${entry.movieId}-${index}`
    : `person-${entry.personId}-${index}`;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: colors.background,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  hiddenLayer: {
    opacity: 0,
  },
});
