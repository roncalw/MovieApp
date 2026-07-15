/**
 * Coordinates search resets that originate from the drawer.
 *
 * Search screens register their existing reset callback here. The drawer calls
 * resetSearchPageForDrawerNavigation only when one of its destinations is
 * selected. Generic focus loss is deliberately not observed, so opening Movie
 * Detail or Person Detail preserves the search page underneath it.
 */
import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { AppDrawerParamList } from '../../types/navigation/navigationTypes';

export type DrawerRouteName = keyof AppDrawerParamList;
export type SearchPageRouteName = keyof Pick<
  AppDrawerParamList,
  'AdvancedSearch' | 'SearchByMovieTitle'
>;

type SearchPageResetHandler = () => void;

type SearchPageResetCoordinatorValue = {
  registerSearchPageReset: (
    routeName: SearchPageRouteName,
    resetSearchPage: SearchPageResetHandler,
  ) => () => void;
  resetSearchPageForDrawerNavigation: (
    currentRouteName: string | undefined,
    selectedRouteName: string,
  ) => void;
};

const SearchPageResetCoordinatorContext =
  createContext<SearchPageResetCoordinatorValue | null>(null);

export function SearchPageResetCoordinatorProvider({
  children,
}: PropsWithChildren) {
  const resetHandlersRef = useRef(
    new Map<SearchPageRouteName, SearchPageResetHandler>(),
  );

  const registerSearchPageReset = useCallback(
    (
      routeName: SearchPageRouteName,
      resetSearchPage: SearchPageResetHandler,
    ) => {
      resetHandlersRef.current.set(routeName, resetSearchPage);

      return () => {
        if (resetHandlersRef.current.get(routeName) === resetSearchPage) {
          resetHandlersRef.current.delete(routeName);
        }
      };
    },
    [],
  );

  const resetSearchPageForDrawerNavigation = useCallback(
    (currentRouteName: string | undefined, selectedRouteName: string) => {
      if (
        !shouldResetSearchForDrawerNavigation(
          currentRouteName,
          selectedRouteName,
        )
      ) {
        return;
      }

      resetHandlersRef.current.get(currentRouteName)?.();
    },
    [],
  );

  const value = useMemo<SearchPageResetCoordinatorValue>(
    () => ({
      registerSearchPageReset,
      resetSearchPageForDrawerNavigation,
    }),
    [registerSearchPageReset, resetSearchPageForDrawerNavigation],
  );

  return (
    <SearchPageResetCoordinatorContext.Provider value={value}>
      {children}
    </SearchPageResetCoordinatorContext.Provider>
  );
}

export function useRegisterSearchPageReset(
  routeName: SearchPageRouteName,
  resetSearchPage: SearchPageResetHandler,
) {
  const { registerSearchPageReset } = useSearchPageResetCoordinator();

  useEffect(
    () => registerSearchPageReset(routeName, resetSearchPage),
    [registerSearchPageReset, resetSearchPage, routeName],
  );
}

export function useSearchPageResetCoordinator() {
  const context = useContext(SearchPageResetCoordinatorContext);

  if (!context) {
    throw new Error(
      'Search page reset coordination must be used inside its provider.',
    );
  }

  return context;
}

export function shouldResetSearchForDrawerNavigation(
  currentRouteName: string | undefined,
  selectedRouteName: string,
): currentRouteName is SearchPageRouteName {
  return (
    currentRouteName !== selectedRouteName &&
    (currentRouteName === 'AdvancedSearch' ||
      currentRouteName === 'SearchByMovieTitle')
  );
}
