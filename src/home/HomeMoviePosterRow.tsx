/*
Step: Home movie poster row
   * /MovieApp/src/home/HomeMoviePosterRow.tsx
Imported by:
   * /MovieApp/src/home/HomeScreen.tsx
Purpose:
   * Renders one horizontal poster row for the Home page, matching the legacy carousel shape while keeping the tap action owned
     by HomeScreen.
*/
import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  View,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import type { HomeMoviePosterRowProps } from '../types/home/homeTypes';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import { getMovieImagePath, getMovieImageUri } from '../utils/movieImages';
import { MovieRemoteImage } from '../shared/images/MovieRemoteImage';
import { imageAssets } from '../styles/assets';
import { HOME_POSTER_ROW_IMAGE_SIZE } from './homeImageSizes';

function HomeMoviePosterRowComponent({
  title,
  movies,
  isLoading,
  isError,
  imageRefreshGeneration,
  unavailableImageUris,
  onMoviePress,
  onTitlePress,
}: HomeMoviePosterRowProps) {
  const posterMovies = useMemo(
    () => movies?.filter(movie => Boolean(getMovieImagePath(movie))) ?? [],
    [movies],
  );

  return (
    <View style={styles.rowSection}>
      <Pressable
        onPress={onTitlePress}
        style={styles.rowTitleLink}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title} in Advanced Search`}
      >
        <Text allowFontScaling={false} style={styles.rowTitle}>
          {title}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={scaleSize(18)}
          color={colors.brandText}
        />
      </Pressable>

      {isLoading ? (
        <View style={styles.rowStatus}>
          <ActivityIndicator size="small" />
        </View>
      ) : null}

      {isError ? (
        <Text allowFontScaling={false} style={styles.rowError}>
          Error loading movies
        </Text>
      ) : null}

      {!isLoading && !isError ? (
        <FlatList
          data={posterMovies}
          keyExtractor={item => item.id.toString()}
          horizontal
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.posterListContent}
          renderItem={({ item }) => {
            const movieImageUri = getMovieImageUri(
              item,
              HOME_POSTER_ROW_IMAGE_SIZE,
            );

            return (
              <Pressable
                onPress={() => onMoviePress(item)}
                style={styles.posterCard}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title || item.original_title}`}
              >
                {movieImageUri && unavailableImageUris?.has(movieImageUri) ? (
                  <Image
                    source={imageAssets.missingMovie}
                    style={styles.posterImage}
                    resizeMode="cover"
                    fadeDuration={0}
                  />
                ) : movieImageUri ? (
                  <MovieRemoteImage
                    uri={movieImageUri}
                    fallbackSource={imageAssets.missingMovie}
                    movieId={item.id}
                    diagnosticContext={`Home ${title}`}
                    refreshGeneration={imageRefreshGeneration}
                    style={styles.posterImage}
                    resizeMode="cover"
                    fadeDuration={0}
                  />
                ) : null}
              </Pressable>
            );
          }}
        />
      ) : null}
    </View>
  );
}

/**
 * Query and image-preparation updates arrive one category at a time. Once this
 * row's own inputs are unchanged, it does not need to rebuild its FlatList just
 * because another Home category finished loading.
 */
export const HomeMoviePosterRow = memo(HomeMoviePosterRowComponent);

const styles = StyleSheet.create({
  rowSection: {
    paddingTop: scaleSize(25),
    backgroundColor: colors.background,
  },
  rowTitle: {
    ...typography.pageTitle,
    fontSize: scaleSize(20),
    lineHeight: scaleSize(26),
    color: colors.brandText,
  },
  rowTitleLink: {
    alignSelf: 'flex-start',
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(5),
  },
  posterListContent: {
    paddingHorizontal: scaleSize(5),
    paddingBottom: scaleSize(16),
  },
  posterCard: {
    padding: scaleSize(5),
    height: scaleSize(210),
    alignItems: 'center',
  },
  posterImage: {
    width: scaleSize(120),
    height: scaleSize(200),
    borderRadius: scaleSize(20),
    backgroundColor: '#f3f4f6',
  },
  rowStatus: {
    minHeight: scaleSize(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowError: {
    ...typography.feedbackBody,
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(16),
    color: colors.brandText,
  },
});
