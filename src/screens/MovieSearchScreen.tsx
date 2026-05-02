/*
Step: 5
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Imported by:
   * /MovieApp/App.tsx
Next step path:
   * /MovieApp/src/components/header/HeaderMovieSearch.tsx
   * /MovieApp/src/components/body/MovieResults.tsx
Purpose:
   * Renders the movie search page, lets the parent header coordinate its two subheaders, and owns the screen-level switch
     between search results mode and movie-detail mode.
*/
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useMovieSearchQuery } from '../hooks/queries/useMovieSearchQuery';
import { HeaderMovieSearch } from '../components/header/HeaderMovieSearch';
import { MovieResults } from '../components/body/MovieResults';
import type { MovieSearchParams } from '../types/movieSearchParams';
import type { movieType } from '../types/MovieTypes';
import { MovieDetail } from './MovieDetail';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import {
  getDefaultBeginDate,
  getDefaultEndDate,
} from '../utils/movieSearchDates';

/*
  WHAT THIS SCREEN DOES:
  - Replaces the old popular-movies page with a single movie search page
  - Shows filter controls at the top
  - Shows the results list underneath

  WHY THIS CHANGES:
  - You said this should be the page for now
  - No second page should be added
*/
export function MovieSearchScreen() {
  const defaultBeginDate = getDefaultBeginDate();
  const defaultEndDate = getDefaultEndDate();
  const queryClient = useQueryClient();

  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [hasDisplayedFilterChanges, setHasDisplayedFilterChanges] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedMovieFromList, setSelectedMovieFromList] = useState<movieType | null>(null);
  const [submittedParams, setSubmittedParams] = useState<MovieSearchParams>({
    movieRatings: '',
    beginDate: defaultBeginDate,
    endDate: defaultEndDate,
    movieGenres: [],
    movieStreamers: [],
    movieVoteCount: '',
    movieSortBy: '',
  });
  const hasActiveSubmittedSearch = hasSubmittedSearch && !hasDisplayedFilterChanges;

  function handleApplyFilters(nextParams: MovieSearchParams) {
    setSelectedMovieId(null);
    setSelectedMovieFromList(null);
    setHasDisplayedFilterChanges(false);
    setSubmittedParams(nextParams);
    setHasSubmittedSearch(true);
  }

  function handleOpenMovie(nextMovie: movieType) {
    setSelectedMovieId(nextMovie.id);
    setSelectedMovieFromList(nextMovie);
  }

  function handleCloseMovieDetail() {
    setSelectedMovieId(null);
    setSelectedMovieFromList(null);
  }

  useEffect(() => {
    if (!hasSubmittedSearch || !hasDisplayedFilterChanges) {
      return;
    }

    queryClient.removeQueries({
      queryKey: ['movieSearch', submittedParams],
      exact: true,
    });
    setHasSubmittedSearch(false);
  }, [
    hasDisplayedFilterChanges,
    hasSubmittedSearch,
    queryClient,
    submittedParams,
  ]);

  /*
    WHAT THIS HOOK CALL DOES:
    - Runs the query through TanStack Query

    WHY THIS EXISTS:
    - The screen should not call the API directly
    - The hook owns cache/loading/error behavior
  */
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMovieSearchQuery(submittedParams, hasActiveSubmittedSearch);

  const movies = useMemo(
    () =>
      hasActiveSubmittedSearch ? data?.pages.flatMap((page) => page.movies) ?? [] : [],
    [data, hasActiveSubmittedSearch]
  );
  const loadedPages = hasActiveSubmittedSearch ? data?.pages.length ?? 0 : 0;
  const totalPages = hasActiveSubmittedSearch ? data?.pages[0]?.totalPages ?? null : 0;
  const isDetailOpen = selectedMovieId !== null;

  /*
    WHAT THIS DOES:
    - Shows the loading state during the query

    WHY:
    - The screen must handle loading explicitly
  */
  if (hasActiveSubmittedSearch && isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        {/*
          Lock these feedback messages to the shared UI typography so they keep
          the same intended size instead of picking up extra device font scaling.
        */}
        <Text allowFontScaling={false} style={styles.message}>
          Loading movies...
        </Text>
      </View>
    );
  }

  /*
    WHAT THIS DOES:
    - Shows the error state if the query fails

    WHY:
    - A failed search should show a clear error instead of failing silently
  */
  if (hasActiveSubmittedSearch && isError) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={styles.centered}>
        <Text allowFontScaling={false} style={styles.errorText}>
          Error loading movies
        </Text>
        <Text allowFontScaling={false} style={styles.message}>
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderMovieSearch
        title="Movie Search"
        appliedParams={submittedParams}
        loadedPages={loadedPages}
        totalPages={totalPages}
        isDetailOpen={isDetailOpen}
        onRequestDetailBack={handleCloseMovieDetail}
        onSubmitFilters={handleApplyFilters}
        onDisplayedFiltersDirtyChange={setHasDisplayedFilterChanges}
      >
        <MovieResults
          movies={movies}
          cardVariant="posterRating"
          onMoviePress={handleOpenMovie}
          onEndReached={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </HeaderMovieSearch>

      {selectedMovieId !== null ? (
        <View style={styles.detailContainer}>
          <MovieDetail
            movieId={selectedMovieId}
            initialMovie={selectedMovieFromList}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    /*
      scaleSize(...) is only used here for the loading/error layout so the
      horizontal breathing room stays proportional on compact and larger phones.
    */
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
    backgroundColor: colors.background,
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    textAlign: 'center',
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.feedbackTitle,
    color: colors.brandText,
  },
});
