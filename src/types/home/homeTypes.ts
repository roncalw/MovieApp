/**
 * Type definitions for the Home page movie sections.
 *
 * These props describe the data and callbacks needed by the Home hero carousel
 * and horizontal poster rows. They keep the Home components reusable while the
 * parent screen remains responsible for fetching movies and opening details.
 */

import type { movieType } from '../movie/MovieTypes';
import type { MovieSearchParams } from '../search/movieSearchParams';

export type HomeAdvancedSearchSectionId =
  | 'popular'
  | 'family'
  | 'comedy'
  | 'drama'
  | 'crime'
  | 'horror'
  | 'music'
  | 'documentary';

export type HomeAdvancedSearchSectionConfig = {
  id: HomeAdvancedSearchSectionId;
  title: string;
  advancedSearchParams: Partial<MovieSearchParams>;
};

export type HomeHeroCarouselProps = {
  movies: movieType[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isAutoPlayPaused?: boolean;
  onMoviePress: (movie: movieType) => void;
};

export type HomeMoviePosterRowProps = {
  title: string;
  movies: movieType[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onMoviePress: (movie: movieType) => void;
  onTitlePress?: () => void;
};
