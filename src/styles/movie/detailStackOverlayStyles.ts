/**
 * Styles for the stacked Movie/Person detail overlay.
 *
 * Imported by:
 * - src/movie/DetailStackOverlay.tsx
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const detailStackOverlayStyles = StyleSheet.create({
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
