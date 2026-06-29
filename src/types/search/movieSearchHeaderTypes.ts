/**
 * Type definitions for the Advanced Search header.
 *
 * The header is split into parent and child components, but they still need to
 * coordinate one shared submit action, filter state, and paging text. The
 * context type is the shared "message packet" that
 * lets those header pieces talk without pushing all of that wiring back into
 * the main search screen.
 */

import type { MovieSearchParams } from './movieSearchParams';

export type HeaderMovieSearchProps = {
  title: string;
  appliedParams: MovieSearchParams;
  loadedPages: number;
  totalPages: number | null;
  excludeSeenMovies: boolean;
  onRequestDrawerOpen: () => void;
  onRequestTitleSearch?: () => void;
  onToggleExcludeSeenMovies: () => void;
  onSubmitFilters: (params: MovieSearchParams) => void;
  onDisplayedFiltersDirtyChange: (isDirty: boolean) => void;
};

export type HeaderMovieSearchContextValue = {
  appliedParams: MovieSearchParams;
  loadedPages: number;
  totalPages: number | null;
  onSubmitFilters: (params: MovieSearchParams) => void;
  onDisplayedFiltersDirtyChange: (isDirty: boolean) => void;
  excludeSeenMovies: boolean;
  onToggleExcludeSeenMovies: () => void;
  isSubmitDisabled: boolean;
  onValidityChange: (isInvalid: boolean) => void;
  registerSubmitHandler: (handler: (() => void) | null) => void;
  submitDraftFilters: () => void;
};

export type SubHeaderTopProps = {
  title: string;
  onRequestDrawerOpen: () => void;
  searchModeLinkLabel?: string;
  onSearchModeLinkPress?: () => void;
};
