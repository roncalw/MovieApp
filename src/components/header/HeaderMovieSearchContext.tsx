/*
Step: 5
   * /MovieApp/src/components/header/HeaderMovieSearchContext.tsx
Imported by:
   * /MovieApp/src/components/header/HeaderMovieSearch.tsx
   * /MovieApp/src/components/header/SubHeaderTop.tsx
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
Next step path:
   * /MovieApp/src/components/body/MovieResults.tsx
Purpose:
   * Holds the shared movie-search header context so the parent header and its two child subheaders can coordinate without
     pushing that wiring back into MovieSearchScreen.
*/
import { createContext, useContext } from 'react';
import type { MovieSearchParams } from '../../types/movieSearchParams';

export type HeaderMovieSearchContextValue = {
  appliedParams: MovieSearchParams;
  loadedPages: number;
  totalPages: number | null;
  onSubmitFilters: (params: MovieSearchParams) => void;
  isSubmitDisabled: boolean;
  onValidityChange: (isInvalid: boolean) => void;
  registerSubmitHandler: (handler: (() => void) | null) => void;
  submitDraftFilters: () => void;
};

export const HeaderMovieSearchContext =
  createContext<HeaderMovieSearchContextValue | null>(null);

export function useHeaderMovieSearchContext() {
  const contextValue = useContext(HeaderMovieSearchContext);

  if (!contextValue) {
    throw new Error(
      'useHeaderMovieSearchContext must be used inside HeaderMovieSearch.'
    );
  }

  return contextValue;
}
