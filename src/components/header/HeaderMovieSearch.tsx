/*
Step: 5
   * /MovieApp/src/components/header/HeaderMovieSearch.tsx
Imported by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/components/header/SubHeaderTop.tsx
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
Purpose:
   * Acts as the parent header "babysitter" that coordinates the top submit button and the movie-search fields without making
     MovieSearchScreen own that sibling wiring.
*/
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MovieSearchParams } from '../../types/movieSearchParams';
import {
  HeaderMovieSearchContext,
  type HeaderMovieSearchContextValue,
} from './HeaderMovieSearchContext';
import { SubHeaderMovieSearchFields } from './SubHeaderMovieSearchFields';
import { SubHeaderTop } from './SubHeaderTop';

type HeaderMovieSearchProps = {
  title: string;
  appliedParams: MovieSearchParams;
  loadedPages: number;
  totalPages: number | null;
  excludeSeenMovies: boolean;
  isDetailOpen: boolean;
  onRequestDetailBack: () => void;
  onRequestDrawerOpen: () => void;
  onRequestTitleSearch?: () => void;
  onToggleExcludeSeenMovies: () => void;
  onSubmitFilters: (params: MovieSearchParams) => void;
  onDisplayedFiltersDirtyChange: (isDirty: boolean) => void;
};

export function HeaderMovieSearch({
  title,
  appliedParams,
  loadedPages,
  totalPages,
  excludeSeenMovies,
  isDetailOpen,
  onRequestDetailBack,
  onRequestDrawerOpen,
  onRequestTitleSearch,
  onToggleExcludeSeenMovies,
  onSubmitFilters,
  onDisplayedFiltersDirtyChange,
}: HeaderMovieSearchProps) {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const submitHandlerRef = useRef<(() => void) | null>(null);

  const registerSubmitHandler = useCallback((handler: (() => void) | null) => {
    submitHandlerRef.current = handler;
  }, []);

  const submitDraftFilters = useCallback(() => {
    submitHandlerRef.current?.();
  }, []);

  const contextValue = useMemo<HeaderMovieSearchContextValue>(
    () => ({
      appliedParams,
      loadedPages,
      totalPages,
      onSubmitFilters,
      onDisplayedFiltersDirtyChange,
      excludeSeenMovies,
      onToggleExcludeSeenMovies,
      isSubmitDisabled,
      isDetailOpen,
      onValidityChange: setIsSubmitDisabled,
      registerSubmitHandler,
      submitDraftFilters,
      triggerDetailBack: onRequestDetailBack,
    }),
    [
      appliedParams,
      excludeSeenMovies,
      isDetailOpen,
      isSubmitDisabled,
      loadedPages,
      onDisplayedFiltersDirtyChange,
      onRequestDetailBack,
      onToggleExcludeSeenMovies,
      onSubmitFilters,
      registerSubmitHandler,
      submitDraftFilters,
      totalPages,
    ],
  );

  return (
    <HeaderMovieSearchContext.Provider value={contextValue}>
      <SubHeaderTop
        title={title}
        onRequestDrawerOpen={onRequestDrawerOpen}
        searchModeLinkLabel={onRequestTitleSearch ? 'Search by Title' : undefined}
        onSearchModeLinkPress={onRequestTitleSearch}
      />
      <View style={isDetailOpen ? styles.filtersHidden : null}>
        <SubHeaderMovieSearchFields />
      </View>
    </HeaderMovieSearchContext.Provider>
  );
}

const styles = StyleSheet.create({
  filtersHidden: {
    display: 'none',
  },
});
