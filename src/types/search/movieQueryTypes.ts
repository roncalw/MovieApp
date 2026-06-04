/**
 * Type definitions for movie-query hook page data.
 *
 * TanStack Query loads paged search results a page at a time. The cursor page
 * type describes one returned page plus the "nextCursor" token used to ask the
 * Cloudflare Worker for the next page. A cursor is like a bookmark: instead of
 * saying "page 2", the server hands the app a token that marks exactly where to
 * continue.
 */

import type { movieSearchResults } from '../movie/MovieTypes';

export type CursorMovieSearchPage = movieSearchResults & {
  nextCursor: string | null;
};
