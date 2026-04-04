/*
  This is your app-level movie type.

  You specifically asked to use the name movieType, so I am keeping that name.

  IN THIS PROJECT:
  - This is the movie shape your UI will depend on
  - PopularMoviesScreen should use THIS type
  - Hooks and screens should not depend directly on the raw supplier payload if avoidable

  WHY THIS FILE EXISTS:
  - It gives your app a stable internal movie shape
  - If the supplier changes later, you want the rest of the app to change as little as possible

  NOTE:
  - Some of these fields may not actually be present in the "popular movies" list payload
    from TMDB for every endpoint in the same way, especially things like budget/revenue/runtime
  - But you asked to keep this exact movieType shape, so this file reflects that request
*/
export type movieType = {
  id: number;
  adult: boolean;
  backdrop_path?: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  genreIds: number[];
  budget: number;
  revenue: number;
  runtime: number;
};