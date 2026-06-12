/*
Step: 5
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
Imported by:
   * /MovieApp/App.tsx
Next step path:
   * /MovieApp/src/search/advanced/HeaderMovieSearch.tsx
   * /MovieApp/src/search/results/MovieResults.tsx
Purpose:
   * Renders the movie search page, lets the parent header coordinate its two subheaders, and owns the screen-level switch
     between search results mode and movie-detail mode.
*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useQueryClient } from '@tanstack/react-query';
import { useMovieSearchQuery } from '../../hooks/useMovieSearchQuery';
import { HeaderMovieSearch } from './HeaderMovieSearch';
import { MovieResults } from '../results/MovieResults';
import { DetailStackOverlay } from '../../movie/DetailStackOverlay';
import type { MovieSearchParams } from '../../types/search/movieSearchParams';
import { movieSearchScreenStyles as styles } from '../../styles/search/movieSearchScreenStyles';
import { useDetailStack } from '../../hooks/useDetailStack';
import {
  getDefaultBeginDate,
  getDefaultEndDate,
} from '../../utils/movieSearchDates';
import {
  getStoredMovieIds,
  MOVIE_SEEN_STORAGE_KEY,
} from '../../utils/storage/movieUserListsStorage';
import type { AppDrawerParamList } from '../../types/navigation/navigationTypes';

const MIN_VISIBLE_FILTERED_RESULTS = 20;

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
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [hasDisplayedFilterChanges, setHasDisplayedFilterChanges] =
    useState(false);
  const {
    detailStack,
    isDetailStackOpen,
    pushMovie,
    pushPerson,
    popDetail,
    closeAllDetails,
  } = useDetailStack();
  const [excludeSeenMovies, setExcludeSeenMovies] = useState(false);
  const [seenMovieIds, setSeenMovieIds] = useState<Set<number>>(new Set());
  const [submittedParams, setSubmittedParams] = useState<MovieSearchParams>({
    movieRatings: '',
    beginDate: defaultBeginDate,
    endDate: defaultEndDate,
    movieGenres: [],
    movieStreamers: [],
    movieVoteCount: '',
    movieSortBy: '',
  });
  const hasActiveSubmittedSearch =
    hasSubmittedSearch && !hasDisplayedFilterChanges;

  function handleApplyFilters(nextParams: MovieSearchParams) {
    closeAllDetails();
    refreshSeenMovieIds();
    setHasDisplayedFilterChanges(false);
    setSubmittedParams(nextParams);
    setHasSubmittedSearch(true);
  }

  function handleToggleExcludeSeenMovies() {
    setExcludeSeenMovies(currentValue => !currentValue);
    setHasDisplayedFilterChanges(true);
  }

  const refreshSeenMovieIds = useCallback(async () => {
    try {
      setSeenMovieIds(await getStoredMovieIds(MOVIE_SEEN_STORAGE_KEY));
    } catch (error) {
      console.error('Error loading seen movie ids:', error);
      setSeenMovieIds(new Set());
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshSeenMovieIds();
    }, [refreshSeenMovieIds])
  );

  const handlePopDetail = useCallback(() => {
    popDetail();
    refreshSeenMovieIds();
  }, [popDetail, refreshSeenMovieIds]);

  const handleCloseAllDetails = useCallback(() => {
    closeAllDetails();
    refreshSeenMovieIds();
  }, [closeAllDetails, refreshSeenMovieIds]);

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
      hasActiveSubmittedSearch
        ? data?.pages.flatMap(page => page.movies) ?? []
        : [],
    [data, hasActiveSubmittedSearch],
  );
  const visibleMovies = useMemo(() => {
    if (!excludeSeenMovies) {
      return movies;
    }

    return movies.filter(movie => !seenMovieIds.has(movie.id));
  }, [excludeSeenMovies, movies, seenMovieIds]);
  const loadedPages = hasActiveSubmittedSearch ? data?.pages.length ?? 0 : 0;
  const totalPages = hasActiveSubmittedSearch
    ? data?.pages[0]?.totalPages ?? null
    : 0;
  const isDetailOpen = isDetailStackOpen;

  useEffect(() => {
    const shouldFetchMoreFilteredResults =
      hasActiveSubmittedSearch &&
      excludeSeenMovies &&
      hasNextPage &&
      !isFetchingNextPage &&
      movies.length > 0 &&
      visibleMovies.length < MIN_VISIBLE_FILTERED_RESULTS;

    if (shouldFetchMoreFilteredResults) {
      fetchNextPage();
    }
  }, [
    excludeSeenMovies,
    fetchNextPage,
    hasActiveSubmittedSearch,
    hasNextPage,
    isFetchingNextPage,
    movies.length,
    visibleMovies.length,
  ]);

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
    const message = error instanceof Error ? error.message : 'Unknown error';

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
      <View
        pointerEvents={isDetailOpen ? 'none' : 'auto'}
        accessibilityElementsHidden={isDetailOpen}
        importantForAccessibility={isDetailOpen ? 'no-hide-descendants' : 'auto'}
        style={isDetailOpen ? styles.headerHidden : null}
      >
        <HeaderMovieSearch
          title="Movie Search"
          appliedParams={submittedParams}
          loadedPages={loadedPages}
          totalPages={totalPages}
          excludeSeenMovies={excludeSeenMovies}
          isDetailOpen={false}
          onRequestDetailBack={handlePopDetail}
          onRequestDrawerOpen={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          onRequestTitleSearch={() =>
            navigation.navigate('SearchByMovieTitle', {
              returnTo: 'AdvancedSearch',
            })
          }
          onToggleExcludeSeenMovies={handleToggleExcludeSeenMovies}
          onSubmitFilters={handleApplyFilters}
          onDisplayedFiltersDirtyChange={setHasDisplayedFilterChanges}
        />
      </View>

      <View style={styles.contentStack}>
        <View
          pointerEvents={isDetailOpen ? 'none' : 'auto'}
          accessibilityElementsHidden={isDetailOpen}
          importantForAccessibility={
            isDetailOpen ? 'no-hide-descendants' : 'auto'
          }
          style={[
            styles.searchContent,
            isDetailOpen ? styles.searchContentHidden : null,
          ]}
        >
          <MovieResults
            movies={visibleMovies}
            cardVariant="posterRating"
            onMoviePress={pushMovie}
            onEndReached={hasActiveSubmittedSearch ? fetchNextPage : undefined}
            hasNextPage={hasActiveSubmittedSearch && hasNextPage}
            isFetchingNextPage={
              hasActiveSubmittedSearch && isFetchingNextPage
            }
          />
        </View>

        <DetailStackOverlay
          detailStack={detailStack}
          onPopDetail={handlePopDetail}
          onCloseAllDetails={handleCloseAllDetails}
          onPushMovie={pushMovie}
          onPushPerson={pushPerson}
        />
      </View>
    </View>
  );
}
