/**
 * Shared reset operation used by both search pages.
 *
 * The page supplies its local state reset because Title Search and Advanced
 * Search own different controls. This hook performs the common work once:
 * dismiss the keyboard, remove the page's cached searches, then reset local UI.
 */
import { useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

export function useSearchPageReset({
  queryKey,
  resetLocalState,
}: {
  queryKey: QueryKey;
  resetLocalState: () => void;
}) {
  const queryClient = useQueryClient();

  return useCallback(() => {
    Keyboard.dismiss();
    queryClient.removeQueries({ queryKey });
    resetLocalState();
  }, [queryClient, queryKey, resetLocalState]);
}
