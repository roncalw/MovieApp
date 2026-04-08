/*
Step: 5
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Called by:
   * /MovieApp/App.tsx
Next step path:
   * /MovieApp/src/components/MovieSearchHeader.tsx
   * /MovieApp/src/components/MovieResultsList.tsx
Purpose:
   * Renders the movie search filters and delegates the shared results-list/detail flow to the reusable movie results component.
*/
import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useMovieSearchQuery } from '../hooks/queries/useMovieSearchQuery';
import { MovieSearchHeader } from '../components/MovieSearchHeader';
import { MovieResultsList } from '../components/MovieResultsList';

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultBeginDate() {
  const currentYear = new Date().getFullYear();

  return `${currentYear - 5}-01-01`;
}

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
  /*
    WHAT THESE STATE VALUES DO:
    - Hold the current filter selections for the query

    WHY THEY EXIST:
    - The page is now query-driven by user selections
  */
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedStreamer, setSelectedStreamer] = useState<string>('');
  const [selectedSortValue, setSelectedSortValue] = useState<string>('');
  const [beginDate, setBeginDate] = useState<string>(getDefaultBeginDate);
  const [endDate, setEndDate] = useState<string>(getTodayDateString);

  /*
    WHAT THIS useMemo DOES:
    - Converts the sort selector choice into:
        movieVoteCount
        movieSortBy

    WHY THIS EXISTS:
    - Your previous code used one radio selection to drive both values
    - This preserves that logic clearly in one place
  */
  const { movieVoteCount, movieSortBy } = useMemo(() => {
    let sortByForQuery = '';
    let voteCount = '';

    if (selectedSortValue === '') {
      sortByForQuery = '';
      voteCount = '';
    } else if (selectedSortValue === '0') {
      voteCount = '0';
      sortByForQuery = 'popularity.desc';
    } else {
      voteCount = selectedSortValue;
      sortByForQuery = 'vote_average.desc';
    }

    return {
      movieVoteCount: voteCount,
      movieSortBy: sortByForQuery,
    };
  }, [selectedSortValue]);

  /*
    WHAT THIS useMemo DOES:
    - Builds the params object for the query hook

    WHY THIS EXISTS:
    - Keeps the query call clean
    - Matches the typed service input
  */
  const queryParams = useMemo(
    () => ({
      movieRatings: selectedRating,
      beginDate,
      endDate,
      movieGenres: selectedGenre,
      movieStreamers: selectedStreamer,
      movieVoteCount,
      movieSortBy,
    }),
    [
      selectedRating,
      beginDate,
      endDate,
      selectedGenre,
      selectedStreamer,
      movieVoteCount,
      movieSortBy,
    ]
  );

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
  } = useMovieSearchQuery(queryParams);

  const movies = useMemo(
    () => data?.pages.flatMap((page) => page.movies) ?? [],
    [data]
  );
  const loadedPages = data?.pages.length ?? 1;
  const totalPages = data?.pages[0]?.totalPages ?? null;

  /*
    WHAT THIS DOES:
    - Shows the loading state during the query

    WHY:
    - The screen must handle loading explicitly
  */
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading movies...</Text>
      </View>
    );
  }

  /*
    WHAT THIS DOES:
    - Shows the error state if the query fails

    WHY:
    - A failed search should show a clear error instead of failing silently
  */
  if (isError) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading movies</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <MovieResultsList
      movies={movies}
      onEndReached={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      ListHeaderComponent={
        <MovieSearchHeader
          beginDate={beginDate}
          endDate={endDate}
          selectedRating={selectedRating}
          selectedGenre={selectedGenre}
          selectedStreamer={selectedStreamer}
          selectedSortValue={selectedSortValue}
          loadedPages={loadedPages}
          totalPages={totalPages}
          movieSortBy={movieSortBy}
          movieVoteCount={movieVoteCount}
          onBeginDateChange={setBeginDate}
          onEndDateChange={setEndDate}
          onRatingChange={setSelectedRating}
          onGenreChange={setSelectedGenre}
          onStreamerChange={setSelectedStreamer}
          onSortChange={setSelectedSortValue}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'red',
  },
});
