/**
 * Trailer feature boundary for Movie Detail.
 *
 * This provider owns trailer retrieval and modal state. Only the trailer button
 * and trailer feedback subscribe to that state, so a late trailer response no
 * longer redraws the movie summary, credits, or streaming sections.
 */
import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useMovieVideosQuery } from '../../hooks/useMovieSearchQuery';
import { DetailResourceError } from '../../shared/DetailResourceState';
import { colors } from '../../styles/colors';
import { scaleSize } from '../../styles/scale';
import { movieDetailStyles as styles } from '../../styles/movie/movieDetailStyles';
import type { movieTrailerVideo } from '../../types/movie/MovieTypes';
import { MovieTrailerModal } from './MovieTrailerModal';

type MovieTrailerContextValue = {
  closeTrailer: () => void;
  error: unknown;
  failed: boolean;
  isRetrying: boolean;
  openTrailer: () => void;
  retry: () => void;
  trailer: movieTrailerVideo | null;
  trailerKey: string | null;
};

const MovieTrailerContext = createContext<MovieTrailerContextValue | null>(
  null,
);

export function MovieTrailerProvider({
  children,
  movieId,
}: PropsWithChildren<{ movieId: number }>) {
  const videosQuery = useMovieVideosQuery(movieId);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const trailer = useMemo(
    () => getPreferredYouTubeTrailer(videosQuery.data?.results ?? []),
    [videosQuery.data?.results],
  );
  const openTrailer = useCallback(() => {
    if (trailer) {
      setActiveTrailerKey(trailer.key);
    }
  }, [trailer]);
  const closeTrailer = useCallback(() => setActiveTrailerKey(null), []);
  const contextValue = useMemo<MovieTrailerContextValue>(
    () => ({
      closeTrailer,
      error: videosQuery.error,
      failed: videosQuery.isError,
      isRetrying: videosQuery.isFetching,
      openTrailer,
      retry: videosQuery.refetch,
      trailer,
      trailerKey: activeTrailerKey,
    }),
    [
      activeTrailerKey,
      closeTrailer,
      openTrailer,
      trailer,
      videosQuery.error,
      videosQuery.isError,
      videosQuery.isFetching,
      videosQuery.refetch,
    ],
  );

  return (
    <MovieTrailerContext.Provider value={contextValue}>
      {children}
      <MovieTrailerModal trailerKey={activeTrailerKey} onClose={closeTrailer} />
    </MovieTrailerContext.Provider>
  );
}

export function MovieTrailerButton() {
  const { openTrailer, trailer } = useMovieTrailerFeature();

  if (!trailer) {
    return null;
  }

  return (
    <Pressable
      onPress={openTrailer}
      style={styles.trailerPlayButton}
      accessibilityRole="button"
      accessibilityLabel={`Play trailer: ${trailer.name}`}
    >
      <View style={styles.trailerPlayCircle}>
        <Ionicons
          name="caret-forward"
          size={scaleSize(26)}
          color={colors.actionOnPrimary}
        />
      </View>
    </Pressable>
  );
}

export function MovieTrailerFeedback() {
  const { error, failed, isRetrying, retry } = useMovieTrailerFeature();

  return failed ? (
    <DetailResourceError
      compact
      error={error}
      isRetrying={isRetrying}
      message="Trailer information could not be loaded."
      onRetry={retry}
      title="Trailer temporarily unavailable"
    />
  ) : null;
}

function useMovieTrailerFeature() {
  const context = useContext(MovieTrailerContext);

  if (!context) {
    throw new Error(
      'Movie trailer components must be inside MovieTrailerProvider.',
    );
  }

  return context;
}

function getPreferredYouTubeTrailer(videos: movieTrailerVideo[]) {
  const youtubeTrailers = videos.filter(
    video => video.site === 'YouTube' && video.type === 'Trailer' && video.key,
  );
  const officialTrailer = youtubeTrailers.find(video => video.official);

  return officialTrailer ?? youtubeTrailers[0] ?? null;
}
