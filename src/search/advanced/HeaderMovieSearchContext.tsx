/*
Step: 5
   * /MovieApp/src/search/advanced/HeaderMovieSearchContext.tsx
Imported by:
   * /MovieApp/src/search/advanced/HeaderMovieSearch.tsx
   * /MovieApp/src/search/advanced/SubHeaderTop.tsx
   * /MovieApp/src/search/advanced/SubHeaderMovieSearchFields.tsx
Next step path:
   * /MovieApp/src/search/results/MovieResults.tsx
Purpose:
   * Holds the shared movie-search header context so the parent header and its two child subheaders can coordinate without
     pushing that wiring back into MovieSearchScreen.
*/
/*
  WHAT THIS IMPORT DOES:
  - brings in React's context tools

  WHY THIS EXISTS:
  - createContext creates the shared header channel
  - useContext reads from that shared header channel

  HOW THIS RELATES TO MOVIE SEARCH:
  - HeaderMovieSearch uses these tools to share header-only values like
    submitDraftFilters and isSubmitDisabled with
    SubHeaderTop and SubHeaderMovieSearchFields
*/
import { createContext, useContext } from 'react';
import type { HeaderMovieSearchContextValue } from '../../types/search/movieSearchHeaderTypes';

/*
  WHAT THIS TYPE DOES:
  - defines the exact shape of the shared data packet for the header family

  WHY THIS EXISTS:
  - so TypeScript knows which values and functions the shared channel carries

  HOW THIS RELATES TO MOVIE SEARCH:
  - this packet includes the applied params, the submit-button disabled state,
    the shared submit wiring, and the detail-back action
*/
/*
  WHAT THIS DOES:
  - asks React to create one shared header communication channel

  WHY THIS EXISTS:
  - so HeaderMovieSearch can publish shared values once
  - and both header children can read those same values later

  HOW THIS RELATES TO MOVIE SEARCH:
  - this is the shared header channel used by HeaderMovieSearch,
    SubHeaderTop, and SubHeaderMovieSearchFields

  IMPORTANT:
  - createContext(...) returns a special React-made context value
  - that returned value already includes .Provider on it
  - that is why HeaderMovieSearch can later render:
      <HeaderMovieSearchContext.Provider value={contextValue}>
*/
export const HeaderMovieSearchContext =
  createContext<HeaderMovieSearchContextValue | null>(null);

/*
  WHAT THIS DOES:
  - creates one helper hook for reading the shared header values

  WHY THIS EXISTS:
  - so header children do not have to repeat useContext(...) manually
  - and so the safety check lives in one place
*/
export function useHeaderMovieSearchContext() {
  /*
    WHAT THIS DOES:
    - reads the current shared value from the header context channel

    HOW THIS RELATES TO MOVIE SEARCH:
    - this is how SubHeaderTop reads values like isSubmitDisabled and
      submitDraftFilters, and how SubHeaderMovieSearchFields reads values
      like onSubmitFilters and registerSubmitHandler
  */
  const contextValue = useContext(HeaderMovieSearchContext);

  /*
    WHAT THIS DOES:
    - throws a clear error if someone tries to read the header context
      outside HeaderMovieSearch

    WHY THIS EXISTS:
    - without the provider above, there is no shared header value to read
  */
  if (!contextValue) {
    throw new Error(
      'useHeaderMovieSearchContext must be used inside HeaderMovieSearch.',
    );
  }

  /*
    WHAT THIS DOES:
    - returns the shared header packet to the caller

    HOW THIS RELATES TO MOVIE SEARCH:
    - the calling header child now receives the shared values/functions it
      needs without HeaderMovieSearch passing them as separate props
  */
  return contextValue;
}
