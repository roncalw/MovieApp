/*
Step: 5
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
Imported by:
   * /MovieApp/App.tsx
Next step path:
   * /MovieApp/src/search/advanced/HeaderMovieSearch.tsx
   * /MovieApp/src/search/results/MovieResults.tsx
Purpose:
   * Renders Advanced Search, owns its submitted filter state, and places the
     filter header and result list in the shared search-page layout.
*/
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import {
  DrawerActions,
  type RouteProp,
  useRoute,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useQueryClient } from '@tanstack/react-query';
import { useMovieSearchQuery } from '../../hooks/useMovieSearchQuery';
import { HeaderMovieSearch } from './HeaderMovieSearch';
import { MovieResults } from '../results/MovieResults';
import type { MovieSearchParams } from '../../types/search/movieSearchParams';
import { movieSearchScreenStyles as styles } from '../../styles/search/movieSearchScreenStyles';
import { useDetailNavigation } from '../../hooks/useDetailNavigation';
import {
  getDefaultBeginDate,
  getDefaultEndDate,
} from '../../utils/movieSearchDates';
import {
  getStoredMovieIds,
  MOVIE_SEEN_STORAGE_KEY,
} from '../../utils/storage/movieUserListsStorage';
import { getHomeAdvancedSearchSection } from '../../home/homeAdvancedSearchSections';
import type { AppDrawerParamList } from '../../types/navigation/navigationTypes';
import { usePageRefresh } from '../../shared/refresh/usePageRefresh';
import { useSearchPageReset } from '../shared/useSearchPageReset';
import { useRegisterSearchPageReset } from '../shared/SearchPageResetCoordinator';
import { RefreshableSearchScreenLayout } from '../shared/RefreshableSearchScreenLayout';
import { queryKeys } from '../../query/queryKeys';

const MIN_VISIBLE_FILTERED_RESULTS = 20;
const MINIMUM_SUBMIT_DISABLED_DURATION_MS = 450;
const DEFAULT_EXCLUDE_SEEN_MOVIES = false;

function buildDefaultMovieSearchParams(
  beginDate: string,
  endDate: string,
): MovieSearchParams {
  return {
    movieRatings: '',
    beginDate,
    endDate,
    movieGenres: [],
    movieStreamers: [],
    movieVoteCount: '',
    movieSortBy: '',
  };
}

function mergeMovieSearchParams(
  currentParams: MovieSearchParams,
  nextParams: Partial<MovieSearchParams>,
): MovieSearchParams {
  return {
    ...currentParams,
    ...nextParams,
    movieGenres: nextParams.movieGenres
      ? [...nextParams.movieGenres]
      : [...currentParams.movieGenres],
    movieStreamers: nextParams.movieStreamers
      ? [...nextParams.movieStreamers]
      : [...currentParams.movieStreamers],
  };
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
  const defaultBeginDate = getDefaultBeginDate();
  const defaultEndDate = getDefaultEndDate();
  const queryClient = useQueryClient();
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const route = useRoute<RouteProp<AppDrawerParamList, 'AdvancedSearch'>>();
  const { openMovieDetail } = useDetailNavigation();
  const appliedPresetRequestIdRef = useRef<string | null>(null);
  const submitStartedAtRef = useRef(0);

  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);
  const [hasDisplayedFilterChanges, setHasDisplayedFilterChanges] =
    useState(false);
  const [excludeSeenMovies, setExcludeSeenMovies] = useState(
    DEFAULT_EXCLUDE_SEEN_MOVIES,
  );
  const [seenMovieIds, setSeenMovieIds] = useState<Set<number>>(new Set());
  const [searchSessionKey, setSearchSessionKey] = useState(0);
  const [submittedParams, setSubmittedParams] = useState<MovieSearchParams>(
    () => buildDefaultMovieSearchParams(defaultBeginDate, defaultEndDate),
  );
  const hasActiveSubmittedSearch =
    hasSubmittedSearch && !hasDisplayedFilterChanges;

  const resetLocalSearchState = useCallback(() => {
    setExcludeSeenMovies(DEFAULT_EXCLUDE_SEEN_MOVIES);
    setSeenMovieIds(new Set());
    setSubmittedParams(
      buildDefaultMovieSearchParams(defaultBeginDate, defaultEndDate),
    );
    setHasDisplayedFilterChanges(false);
    setHasSubmittedSearch(false);
    setIsSearchSubmitting(false);
    submitStartedAtRef.current = 0;
    setSearchSessionKey(currentKey => currentKey + 1);
  }, [defaultBeginDate, defaultEndDate]);
  const resetSearchScreen = useSearchPageReset({
    queryKey: queryKeys.movieSearchRoot,
    resetLocalState: resetLocalSearchState,
  });
  const pageRefresh = usePageRefresh(resetSearchScreen);

  useRegisterSearchPageReset('AdvancedSearch', resetSearchScreen);

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
    }, [refreshSeenMovieIds]),
  );

  const submitSearchParams = useCallback(
    (nextParams: MovieSearchParams) => {
      refreshSeenMovieIds();
      submitStartedAtRef.current = Date.now();
      setIsSearchSubmitting(true);
      setHasDisplayedFilterChanges(false);
      setSubmittedParams(nextParams);
      setHasSubmittedSearch(true);
    },
    [refreshSeenMovieIds],
  );

  function handleApplyFilters(nextParams: MovieSearchParams) {
    submitSearchParams(nextParams);
  }

  useEffect(() => {
    const homeSectionId = route.params?.homeSectionId;
    const presetRequestId = route.params?.presetRequestId;

    if (
      !homeSectionId ||
      !presetRequestId ||
      appliedPresetRequestIdRef.current === presetRequestId
    ) {
      return;
    }

    const homeSection = getHomeAdvancedSearchSection(homeSectionId);
    if (!homeSection) {
      return;
    }

    appliedPresetRequestIdRef.current = presetRequestId;
    submitSearchParams(
      mergeMovieSearchParams(submittedParams, homeSection.advancedSearchParams),
    );
  }, [
    route.params?.homeSectionId,
    route.params?.presetRequestId,
    submitSearchParams,
    submittedParams,
  ]);

  useEffect(() => {
    if (!hasSubmittedSearch || !hasDisplayedFilterChanges) {
      return;
    }

    queryClient.removeQueries({
      queryKey: queryKeys.movieSearch(submittedParams),
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

  useEffect(() => {
    if (!isSearchSubmitting) {
      return;
    }

    const firstResponseHasArrived = (data?.pages.length ?? 0) > 0;
    const searchHasFinished =
      !hasActiveSubmittedSearch || firstResponseHasArrived || isError;
    if (!searchHasFinished) {
      return;
    }

    const disabledDuration = Date.now() - submitStartedAtRef.current;
    const remainingDisabledDuration = Math.max(
      0,
      MINIMUM_SUBMIT_DISABLED_DURATION_MS - disabledDuration,
    );

    if (remainingDisabledDuration === 0) {
      setIsSearchSubmitting(false);
      return;
    }

    const timeoutId = setTimeout(
      () => setIsSearchSubmitting(false),
      remainingDisabledDuration,
    );

    return () => clearTimeout(timeoutId);
  }, [
    data?.pages.length,
    hasActiveSubmittedSearch,
    isError,
    isSearchSubmitting,
  ]);

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

  const searchHeader = (
    <HeaderMovieSearch
      key={searchSessionKey}
      title="Movie Search"
      appliedParams={submittedParams}
      loadedPages={loadedPages}
      totalPages={totalPages}
      excludeSeenMovies={excludeSeenMovies}
      onRequestDrawerOpen={() =>
        navigation.dispatch(DrawerActions.openDrawer())
      }
      onRequestTitleSearch={() =>
        navigation.navigate('SearchByMovieTitle', {
          returnTo: 'AdvancedSearch',
        })
      }
      onToggleExcludeSeenMovies={handleToggleExcludeSeenMovies}
      isSearchSubmitting={isSearchSubmitting}
      onSubmitFilters={handleApplyFilters}
      onDisplayedFiltersDirtyChange={setHasDisplayedFilterChanges}
    />
  );
  const searchErrorMessage =
    error instanceof Error ? error.message : 'Unknown error';

  return (
    <RefreshableSearchScreenLayout topSection={searchHeader} {...pageRefresh}>
      {hasActiveSubmittedSearch && isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text allowFontScaling={false} style={styles.message}>
            Loading movies...
          </Text>
        </View>
      ) : hasActiveSubmittedSearch && isError ? (
        <View style={styles.centered}>
          <Text allowFontScaling={false} style={styles.errorText}>
            Error loading movies
          </Text>
          <Text allowFontScaling={false} style={styles.message}>
            {searchErrorMessage}
          </Text>
          <View style={styles.errorActions}>
            <Pressable
              onPress={resetSearchScreen}
              style={styles.errorPrimaryButton}
              accessibilityRole="button"
              accessibilityLabel="Return to movie search filters"
            >
              <Text
                allowFontScaling={false}
                style={styles.errorPrimaryButtonText}
              >
                Try Again
              </Text>
            </Pressable>
            <Pressable
              onPress={resetSearchScreen}
              style={styles.errorSecondaryButton}
              accessibilityRole="button"
              accessibilityLabel="Return to movie search filters"
            >
              <Text
                allowFontScaling={false}
                style={styles.errorSecondaryButtonText}
              >
                Back to Search
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <MovieResults
          movies={visibleMovies}
          cardVariant="posterRating"
          onMoviePress={openMovieDetail}
          onEndReached={hasActiveSubmittedSearch ? fetchNextPage : undefined}
          hasNextPage={hasActiveSubmittedSearch && hasNextPage}
          isFetchingNextPage={hasActiveSubmittedSearch && isFetchingNextPage}
        />
      )}
    </RefreshableSearchScreenLayout>
  );
}
