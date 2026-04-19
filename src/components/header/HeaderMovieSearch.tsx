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
import type { ReactNode } from 'react';
import { View } from 'react-native';
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
  isDetailOpen: boolean;
  onRequestDetailBack: () => void;
  onSubmitFilters: (params: MovieSearchParams) => void;
  onDisplayedFiltersDirtyChange: (isDirty: boolean) => void;
  children: ReactNode;
};

export function HeaderMovieSearch({
  title,
  appliedParams,
  loadedPages,
  totalPages,
  isDetailOpen,
  onRequestDetailBack,
  onSubmitFilters,
  onDisplayedFiltersDirtyChange,
  children,
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
      isSubmitDisabled,
      isDetailOpen,
      onValidityChange: setIsSubmitDisabled,
      registerSubmitHandler,
      submitDraftFilters,
      triggerDetailBack: onRequestDetailBack,
    }),
    [
      appliedParams,
      isDetailOpen,
      isSubmitDisabled,
      loadedPages,
      onDisplayedFiltersDirtyChange,
      onRequestDetailBack,
      onSubmitFilters,
      registerSubmitHandler,
      submitDraftFilters,
      totalPages,
    ]
  );

  return (
    <HeaderMovieSearchContext.Provider value={contextValue}>
      <SubHeaderTop title={title} />
      <View style={{ display: isDetailOpen ? 'none' : 'flex' }}>
        <SubHeaderMovieSearchFields />
      </View>
      <View style={{ display: isDetailOpen ? 'none' : 'flex', flex: 1 }}>
        {children}
      </View>
    </HeaderMovieSearchContext.Provider>
  );
}
