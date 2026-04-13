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
import type { MovieSearchParams } from '../../types/movieSearchParams';
import {
  HeaderMovieSearchContext,
  type HeaderMovieSearchContextValue,
} from './HeaderMovieSearchContext';
import { SubHeaderTop } from './SubHeaderTop';

type HeaderMovieSearchProps = {
  title: string;
  appliedParams: MovieSearchParams;
  loadedPages: number;
  totalPages: number | null;
  onSubmitFilters: (params: MovieSearchParams) => void;
  children: ReactNode;
};

export function HeaderMovieSearch({
  title,
  appliedParams,
  loadedPages,
  totalPages,
  onSubmitFilters,
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
      isSubmitDisabled,
      onValidityChange: setIsSubmitDisabled,
      registerSubmitHandler,
      submitDraftFilters,
    }),
    [
      appliedParams,
      isSubmitDisabled,
      loadedPages,
      onSubmitFilters,
      registerSubmitHandler,
      submitDraftFilters,
      totalPages,
    ]
  );

  return (
    <HeaderMovieSearchContext.Provider value={contextValue}>
      <SubHeaderTop title={title} />
      {children}
    </HeaderMovieSearchContext.Provider>
  );
}
