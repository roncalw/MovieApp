/**
 * Type definitions for reusable movie-result cards and lists.
 *
 * These props describe the card layout options, rating-badge visibility, and
 * tap/scroll callbacks shared by Advanced Search, title search, Favorites, and
 * Movies I Have Seen. Centralizing them keeps every results page aligned on the
 * same card contract.
 */

import type React from 'react';
import type { movieType } from '../movie/MovieTypes';

export type MovieCardProps = {
  movie: movieType;
  onPress: () => void;
  variant?: 'summary' | 'posterRating';
  showRatingBadge?: boolean;
};

export type MovieResultsProps = {
  movies: movieType[] | undefined;
  ListHeaderComponent?: React.ReactElement | null;
  cardVariant?: 'summary' | 'posterRating';
  showRatingBadge?: boolean;
  onMoviePress?: (movie: movieType) => void;
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};
