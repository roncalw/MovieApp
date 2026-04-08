/*
Step: 3
   * /MovieApp/src/providers/QueryProvider.tsx
Called by:
   * /MovieApp/src/providers/SafeAreaProvider.tsx
Next step path:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Purpose:
   * Creates the shared TanStack Query client and exposes it to the rest of the app so hooks can fetch, cache, and reuse movie 
     data.
*/
import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/*
  QueryClient is the central TanStack Query engine.

  IN THIS PROJECT:
  - It manages the cache for movie-related queries
  - Right now that means the "popular movies" query
  - Later it may also manage:
      - movie details
      - search results
      - genres
      - cast

  WHY WE CREATE IT ONCE:
  - This app needs one shared query manager
  - If QueryClient were recreated repeatedly, cache stability would be lost
  - A single QueryClient lets every movie query hook talk to the same warehouse system
*/
const queryClient = new QueryClient();

/*
  PropsWithChildren is a React utility type.

  WHAT IT DOES:
  - It says this component accepts a prop called children

  WHAT children IS IN THIS PROJECT:
  - QueryProvider is a wrapper component
  - In AppProvider.tsx, SafeAreaProvider wraps QueryProvider
  - QueryProvider then wraps the screen

  So in THIS project, QueryProvider's child is:
    <MovieSearchScreen />

  WHY WE IMPORT PropsWithChildren:
  - Because QueryProvider exists specifically to wrap other components
  - In this project it wraps another provider
  - Later it may indirectly wrap navigation too
*/
export function QueryProvider({ children }: PropsWithChildren) {
  return (
    /*
      QueryClientProvider comes from TanStack Query.

      WHAT IT DOES:
      - Makes the queryClient available to everything nested inside it

      IN THIS PROJECT:
      - PopularMoviesScreen uses usePopularMoviesQuery()
      - usePopularMoviesQuery() calls useQuery(...)
      - useQuery(...) needs access to QueryClient
      - QueryClientProvider is what supplies that access

      THE REAL CHAIN HERE IS:
      App.tsx
        → AppProvider
          → SafeAreaProvider
            → QueryProvider
              → QueryClientProvider
                → MovieSearchScreen
                  → useMovieSearchQuery()
                    → useQuery()

      WHY THIS IS REQUIRED:
      - Without QueryClientProvider, useQuery() will fail
      - TanStack Query hooks require a QueryClient above them in the tree

      ANALOGY:
      - This is the warehouse control system
      - It powers the warehouse manager for anything nested inside it
    */
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
