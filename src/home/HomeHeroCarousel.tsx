/*
Step: Home hero carousel
   * /MovieApp/src/home/HomeHeroCarousel.tsx
Imported by:
   * /MovieApp/src/home/HomeScreen.tsx
Purpose:
   * Renders the legacy-style top movie carousel from TMDB upcoming movies without adding the old image-slider package.
*/
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { movieType } from '../types/movie/MovieTypes';
import type { HomeHeroCarouselProps } from '../types/home/homeTypes';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import { getMovieImagePath, getMovieImageUri } from '../utils/movieImages';
import { MovieRemoteImage } from '../shared/images/MovieRemoteImage';
import { imageAssets } from '../styles/assets';
import { HOME_HERO_IMAGE_SIZE } from './homeImageSizes';

const AUTO_PLAY_INTERVAL_MS = 3000;
const FORCE_HOME_HERO_AUTO_PLAY_PAUSED_FOR_SCREENSHOTS = false;

function HomeHeroCarouselComponent({
  movies,
  isLoading,
  isError,
  error,
  isAutoPlayPaused = false,
  imageRefreshGeneration,
  unavailableImageUris,
  onMoviePress,
}: HomeHeroCarouselProps) {
  const listRef = useRef<FlatList<movieType>>(null);
  const currentIndexRef = useRef(0);
  const [hasUserSwiped, setHasUserSwiped] = useState(false);
  const { width, height } = useWindowDimensions();
  const isIPad = Platform.OS === 'ios' && Platform.isPad;
  // Keep the hero dominant, but leave just enough room for the next row title
  // to peek onto the first screen so Home clearly continues below the fold.
  const heroHeight = Math.round(height * 0.655);
  const heroMovies = useMemo(
    () => movies?.filter(movie => Boolean(getMovieImagePath(movie))) ?? [],
    [movies],
  );

  useEffect(() => {
    currentIndexRef.current = 0;
  }, [heroMovies]);

  useEffect(() => {
    if (
      FORCE_HOME_HERO_AUTO_PLAY_PAUSED_FOR_SCREENSHOTS ||
      isAutoPlayPaused ||
      hasUserSwiped ||
      heroMovies.length <= 1
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % heroMovies.length;
      currentIndexRef.current = nextIndex;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, AUTO_PLAY_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [hasUserSwiped, heroMovies.length, isAutoPlayPaused]);

  function handleScrollBeginDrag() {
    setHasUserSwiped(true);
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    currentIndexRef.current = Math.round(
      event.nativeEvent.contentOffset.x / width,
    );
  }

  function handleScrollToIndexFailed({ index }: { index: number }) {
    const safeIndex = Math.min(index, Math.max(heroMovies.length - 1, 0));
    currentIndexRef.current = safeIndex;

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: safeIndex * width,
        animated: true,
      });
    });
  }

  if (isLoading) {
    return (
      <View style={[styles.statusHero, { height: heroHeight }]}>
        <ActivityIndicator size="large" />
        <Text allowFontScaling={false} style={styles.statusText}>
          Loading featured movies...
        </Text>
      </View>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={[styles.statusHero, { height: heroHeight }]}>
        <Text allowFontScaling={false} style={styles.errorTitle}>
          Error loading featured movies
        </Text>
        <Text allowFontScaling={false} style={styles.statusText}>
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.hero, { height: heroHeight }]}>
      <FlatList
        ref={listRef}
        data={heroMovies}
        keyExtractor={item => item.id.toString()}
        horizontal
        pagingEnabled
        directionalLockEnabled
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const movieImageUri = getMovieImageUri(item, HOME_HERO_IMAGE_SIZE);

          return (
            <Pressable
              onPress={() => onMoviePress(item)}
              style={[
                styles.slide,
                isIPad ? styles.iPadSlide : null,
                { width, height: heroHeight },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title || item.original_title}`}
            >
              {movieImageUri && unavailableImageUris?.has(movieImageUri) ? (
                <Image
                  source={imageAssets.missingMovie}
                  style={styles.heroImage}
                  resizeMode={isIPad ? 'contain' : 'cover'}
                  fadeDuration={0}
                />
              ) : movieImageUri ? (
                <MovieRemoteImage
                  uri={movieImageUri}
                  fallbackSource={imageAssets.missingMovie}
                  movieId={item.id}
                  diagnosticContext="Home hero"
                  refreshGeneration={imageRefreshGeneration}
                  style={styles.heroImage}
                  resizeMode={isIPad ? 'contain' : 'cover'}
                  fadeDuration={0}
                />
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

/**
 * Keep the prepared hero stable while unrelated Home rows finish. The carousel
 * still updates normally when its movies, focus state, or image preparation
 * actually changes.
 */
export const HomeHeroCarousel = memo(HomeHeroCarouselComponent);

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    backgroundColor: '#d9d9d9',
  },
  slide: {
    backgroundColor: '#d9d9d9',
  },
  iPadSlide: {
    backgroundColor: '#000000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  statusHero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
    backgroundColor: colors.surfaceMuted,
  },
  statusText: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.feedbackTitle,
    color: colors.brandText,
    textAlign: 'center',
  },
});
