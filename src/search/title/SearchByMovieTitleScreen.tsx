import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { MovieResults } from '../results/MovieResults';
import { HeaderActionRow } from '../../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../../shared/header/HeaderNavButton';
import { getHeaderNavSecondaryTop } from '../../shared/header/headerNavMetrics';
import { useMovieTitleSearchQuery } from '../../hooks/useMovieSearchQuery';
import { useDetailNavigation } from '../../hooks/useDetailNavigation';
import { useTitleSearchRatings } from './useTitleSearchRatings';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import type { AppDrawerParamList } from '../../types/navigation/navigationTypes';
import { usePageRefresh } from '../../shared/refresh/usePageRefresh';
import { useSearchPageReset } from '../shared/useSearchPageReset';
import { useRegisterSearchPageReset } from '../shared/SearchPageResetCoordinator';
import { queryKeys } from '../../query/queryKeys';
import { prepareMovieImages } from '../../utils/movieImageLoading';
import { fetchMoviesByTitle } from '../../api/tmdb/services/movieService';
import { refreshActiveInfiniteSearch } from '../shared/refreshActiveInfiniteSearch';

export function SearchByMovieTitleScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { openMovieDetail } = useDetailNavigation();
  const route = useRoute<RouteProp<AppDrawerParamList, 'SearchByMovieTitle'>>();
  const [draftTitle, setDraftTitle] = useState('');
  const [submittedTitle, setSubmittedTitle] = useState('');
  const [imageRefreshGeneration, setImageRefreshGeneration] = useState(0);
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMovieTitleSearchQuery(submittedTitle, submittedTitle.length > 0);
  const titleSearchMovies = useMemo(
    () => data?.pages.flatMap(page => page.movies) ?? [],
    [data],
  );
  const { moviesWithRatings, resetRatingHydrationState } =
    useTitleSearchRatings(titleSearchMovies);
  const resetLocalSearchState = useCallback(() => {
    setDraftTitle('');
    setSubmittedTitle('');
    resetRatingHydrationState();
  }, [resetRatingHydrationState]);
  const resetSearchPage = useSearchPageReset({
    queryKey: queryKeys.movieTitleSearchRoot,
    resetLocalState: resetLocalSearchState,
  });
  const refreshTitleSearch = useCallback(async () => {
    if (!submittedTitle) {
      return;
    }

    const activeQueryKey = queryKeys.movieTitleSearch(submittedTitle.trim());

    const refreshedFirstPage = await refreshActiveInfiniteSearch({
      queryClient,
      queryKey: activeQueryKey,
      firstPageParam: 1,
      fetchFirstPage: () =>
        fetchMoviesByTitle(submittedTitle.trim(), 1, { bypassCache: true }),
    });

    await prepareMovieImages([refreshedFirstPage.movies]);
    setImageRefreshGeneration(currentGeneration => currentGeneration + 1);
  }, [queryClient, submittedTitle]);
  const pageRefresh = usePageRefresh(refreshTitleSearch);

  useRegisterSearchPageReset('SearchByMovieTitle', resetSearchPage);

  function handleOpenAdvancedSearch() {
    navigation.navigate('AdvancedSearch');
  }

  function handleBackPress() {
    navigation.navigate(route.params?.returnTo ?? 'Home');
  }

  function handleSubmitSearch() {
    const nextSubmittedTitle = draftTitle.trim();

    Keyboard.dismiss();
    resetRatingHydrationState();
    setSubmittedTitle(nextSubmittedTitle);
  }

  const handleClearTitle = resetSearchPage;
  const isLoadingResults = isLoading;
  const searchFeedback = isLoadingResults ? (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
      <Text allowFontScaling={false} style={styles.message}>
        Loading movies...
      </Text>
    </View>
  ) : isError ? (
    <View style={styles.centered}>
      <Text allowFontScaling={false} style={styles.errorText}>
        Error loading movies
      </Text>
      <Text allowFontScaling={false} style={styles.message}>
        {error instanceof Error ? error.message : 'Unknown error'}
      </Text>
      <View style={styles.errorActions}>
        <Pressable
          onPress={handleClearTitle}
          style={styles.errorPrimaryButton}
          accessibilityRole="button"
          accessibilityLabel="Return to movie title search"
        >
          <Text allowFontScaling={false} style={styles.errorPrimaryButtonText}>
            Try Again
          </Text>
        </Pressable>
        <Pressable
          onPress={handleBackPress}
          style={styles.errorSecondaryButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text
            allowFontScaling={false}
            style={styles.errorSecondaryButtonText}
          >
            Back
          </Text>
        </Pressable>
      </View>
    </View>
  ) : null;
  const searchHeader = (
    <View style={[styles.header, { paddingTop: insets.top + scaleSize(122) }]}>
      <HeaderActionRow
        left={
          <HeaderNavButton
            variant="back"
            anchored={false}
            onPress={handleBackPress}
          />
        }
        center={
          <Text
            allowFontScaling={false}
            adjustsFontSizeToFit
            numberOfLines={1}
            style={styles.title}
          >
            Search by Movie Title
          </Text>
        }
      />
      <Pressable
        onPress={handleOpenAdvancedSearch}
        style={[
          styles.searchModeLink,
          { top: getHeaderNavSecondaryTop(insets.top) },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open Advanced Search"
      >
        <Text allowFontScaling={false} style={styles.searchModeLinkText}>
          Advanced Search
        </Text>
        <Ionicons
          name="chevron-forward"
          size={scaleSize(15)}
          color={colors.brandText}
        />
      </Pressable>

      <View style={styles.searchRow}>
        <View style={styles.searchInputFrame}>
          <TextInput
            value={draftTitle}
            onChangeText={setDraftTitle}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
            placeholder="Search by Movie Title"
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {draftTitle.length > 0 ? (
            <Pressable
              onPress={handleClearTitle}
              style={styles.clearSearchButton}
              accessibilityRole="button"
              accessibilityLabel="Clear movie title search"
            >
              <Ionicons
                name="close-circle"
                size={scaleSize(20)}
                color={colors.textSecondary}
              />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={handleSubmitSearch}
          style={styles.searchButton}
          accessibilityRole="button"
          accessibilityLabel="Search by movie title"
        >
          <Ionicons
            name="search-outline"
            size={scaleSize(30)}
            color="#000000"
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <MovieResults
      movies={searchFeedback ? [] : moviesWithRatings}
      ListHeaderComponent={searchHeader}
      ListHeaderComponentStyle={styles.resultsListHeader}
      ListEmptyComponent={searchFeedback}
      cardVariant="posterRating"
      showRatingBadge
      imageRefreshGeneration={imageRefreshGeneration}
      onMoviePress={openMovieDetail}
      onEndReached={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      {...pageRefresh}
    />
  );
}

const styles = StyleSheet.create({
  resultsListHeader: {
    marginHorizontal: -scaleSize(20),
    marginTop: -scaleSize(24),
    marginBottom: scaleSize(24),
  },
  header: {
    paddingHorizontal: scaleSize(16),
    paddingBottom: scaleSize(18),
    backgroundColor: colors.background,
  },
  title: {
    ...typography.pageTitle,
    width: '100%',
    color: colors.brandText,
    textAlign: 'center',
  },
  searchModeLink: {
    position: 'absolute',
    alignSelf: 'center',
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchModeLinkText: {
    ...typography.summaryBody,
    color: colors.brandText,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(10),
  },
  searchInputFrame: {
    flex: 1,
    height: scaleSize(44),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: Platform.OS === 'android' ? 1 : StyleSheet.hairlineWidth,
    borderColor: colors.textPrimary,
    borderRadius: scaleSize(15),
    paddingLeft: scaleSize(16),
    paddingRight: scaleSize(8),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...typography.inputText,
    color: colors.textPrimary,
    textAlignVertical: 'center',
    paddingVertical: 0,
    transform: [{ translateY: -1 }],
  },
  clearSearchButton: {
    width: scaleSize(32),
    height: scaleSize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    width: scaleSize(48),
    minHeight: scaleSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.feedbackTitle,
    color: colors.brandText,
  },
  errorActions: {
    marginTop: scaleSize(22),
    alignItems: 'center',
    gap: scaleSize(12),
  },
  errorPrimaryButton: {
    minWidth: scaleSize(150),
    minHeight: scaleSize(44),
    paddingHorizontal: scaleSize(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(8),
    backgroundColor: colors.brandText,
  },
  errorPrimaryButtonText: {
    ...typography.buttonLabel,
    color: colors.actionOnPrimary,
  },
  errorSecondaryButton: {
    minWidth: scaleSize(150),
    minHeight: scaleSize(44),
    paddingHorizontal: scaleSize(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brandText,
    borderRadius: scaleSize(8),
    backgroundColor: colors.background,
  },
  errorSecondaryButtonText: {
    ...typography.buttonLabel,
    color: colors.brandText,
  },
});
