/*
Step: 5
   * /MovieApp/src/search/advanced/HeaderMovieSearch.tsx
Imported by:
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/search/advanced/SubHeaderTop.tsx
   * /MovieApp/src/search/advanced/SubHeaderMovieSearchFields.tsx
Purpose:
   * Acts as the parent header "babysitter" that coordinates the top submit button and the movie-search fields without making
     MovieSearchScreen own that sibling wiring.
*/
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  HeaderMovieSearchContext,
} from './HeaderMovieSearchContext';
import { SubHeaderMovieSearchFields } from './SubHeaderMovieSearchFields';
import { SubHeaderTop } from './SubHeaderTop';
import { headerMovieSearchStyles as styles } from '../../styles/search/headerMovieSearchStyles';
import type {
  HeaderMovieSearchContextValue,
  HeaderMovieSearchProps,
} from '../../types/search/movieSearchHeaderTypes';

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
