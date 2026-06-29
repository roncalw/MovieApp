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
import { HeaderMovieSearchContext } from './HeaderMovieSearchContext';
import { SubHeaderMovieSearchFields } from './SubHeaderMovieSearchFields';
import { SubHeaderTop } from './SubHeaderTop';
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
      onValidityChange: setIsSubmitDisabled,
      registerSubmitHandler,
      submitDraftFilters,
    }),
    [
      appliedParams,
      excludeSeenMovies,
      isSubmitDisabled,
      loadedPages,
      onDisplayedFiltersDirtyChange,
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
        searchModeLinkLabel={
          onRequestTitleSearch ? 'Search by Title' : undefined
        }
        onSearchModeLinkPress={onRequestTitleSearch}
      />
      <View>
        <SubHeaderMovieSearchFields />
      </View>
    </HeaderMovieSearchContext.Provider>
  );
}
