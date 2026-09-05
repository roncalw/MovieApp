/**
 * Type definitions for Advanced Search filter controls.
 *
 * In React, "props" are the inputs passed into a component. These props describe
 * the filter labels, selected values, icon/image sources, and callback functions
 * used by the genre, rating, streamer, sort, and year controls. The item types
 * describe the selectable options used to build each popup.
 */

import type { ImageSourcePropType } from 'react-native';
import type { MovieLanguage } from '../tmdb/tmdbApiTypes';

export type FilterPopupVisibilityProps = {
  onPopupVisibilityChange: (isVisible: boolean) => void;
};

export type GenreFieldProps = FilterPopupVisibilityProps & {
  value: string[];
  onChange: (nextValue: string[]) => void;
};

export type RatingFieldProps = FilterPopupVisibilityProps & {
  value: string;
  onChange: (nextValue: string) => void;
};

export type SortFieldProps = FilterPopupVisibilityProps & {
  value: string;
  onChange: (nextValue: string) => void;
};

export type StreamerFieldProps = FilterPopupVisibilityProps & {
  value: string[];
  onChange: (nextValue: string[]) => void;
};

export type LanguageFieldProps = FilterPopupVisibilityProps & {
  value: string[];
  onChange: (nextValue: string[]) => void;
  languages: MovieLanguage[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export type YearWheelFieldProps = FilterPopupVisibilityProps & {
  title: string;
  value: number;
  years: number[];
  onChange: (year: number) => void;
  variant?: 'default' | 'anchoredDate';
  dateRole?: 'begin' | 'end';
};

export type MovieSearchFieldTriggerProps = {
  label: string;
  value: string;
  onPress: () => void;
};

export type MovieSearchPopupChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  reversedSelectionAppearance?: boolean;
  fixedWidth?: boolean;
  subtleBorder?: boolean;
};

export type MovieSearchStreamerTileProps = {
  label: string;
  source: ImageSourcePropType;
  selected: boolean;
  onPress: () => void;
  wide?: boolean;
};

export type MovieSearchModalActionsProps = {
  onCancel: () => void;
  onClose: () => void;
};

export type MovieSearchBulkSelectionLinksProps = {
  onClearAll: () => void;
  onAddAll: () => void;
};

export type LabelValueItem = {
  label: string;
  value: string;
};

export type RatingItem = {
  id: string;
  label: string;
};

export type StreamerItem = {
  label: string;
  value: string;
  image: ImageSourcePropType;
  wide?: boolean;
};

export type SortItem = {
  id: string;
  label: string;
  value: string;
};
