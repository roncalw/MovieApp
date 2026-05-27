import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
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
import { MovieResults } from '../components/body/MovieResults';
import { DetailStackOverlay } from '../components/detail/DetailStackOverlay';
import { HeaderActionRow } from '../components/navigation/HeaderActionRow';
import { HeaderNavButton } from '../components/navigation/HeaderNavButton';
import { getHeaderNavSecondaryTop } from '../components/navigation/headerNavMetrics';
import { useMovieTitleSearchQuery } from '../hooks/queries/useMovieSearchQuery';
import { useDetailStack } from '../hooks/useDetailStack';
import { hydrateMoviesWithCurrentImdbRatings } from '../storage/movieListRatingHydration';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import type { movieType } from '../types/MovieTypes';
import type { AppDrawerParamList } from '../navigation/types';

const MAX_TITLE_SEARCH_RESULTS_TO_HYDRATE = 20;

export function SearchByMovieTitleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const route = useRoute<RouteProp<AppDrawerParamList, 'SearchByMovieTitle'>>();
  const [draftTitle, setDraftTitle] = useState('');
  const [submittedTitle, setSubmittedTitle] = useState('');
  const [hydratedMovies, setHydratedMovies] = useState<movieType[]>([]);
  const [isHydratingRatings, setIsHydratingRatings] = useState(false);
  const {
    detailStack,
    isDetailStackOpen,
    pushMovie,
    pushPerson,
    popDetail,
    closeAllDetails,
    backToOriginalMovie,
  } = useDetailStack();
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
    [data]
  );
  const totalResults = data?.pages[0]?.totalResults ?? 0;
  const shouldHydrateRatings =
    totalResults <= MAX_TITLE_SEARCH_RESULTS_TO_HYDRATE;
  const movies = useMemo(() => {
    if (!data) {
      return [];
    }

    return shouldHydrateRatings ? hydratedMovies : titleSearchMovies;
  }, [data, hydratedMovies, shouldHydrateRatings, titleSearchMovies]);

  function handleOpenAdvancedSearch() {
    navigation.navigate('AdvancedSearch');
  }

  function handleBackPress() {
    navigation.navigate(route.params?.returnTo ?? 'Home');
  }

  function handleSubmitSearch() {
    const nextSubmittedTitle = draftTitle.trim();

    closeAllDetails();
    setHydratedMovies([]);
    setSubmittedTitle(nextSubmittedTitle);
  }

  function handleClearTitle() {
    setDraftTitle('');
    setSubmittedTitle('');
    setHydratedMovies([]);
    closeAllDetails();
  }

  useEffect(() => {
    let isMounted = true;

    async function hydrateSearchResults() {
      if (!data) {
        setHydratedMovies([]);
        return;
      }

      if (!shouldHydrateRatings) {
        /*
          Broad title searches can return hundreds of TMDB matches. When TMDB says
          more than 20 movies match, this screen intentionally skips per-movie
          Cloudflare IMDb lookups so one search does not trigger a large burst of
          rating requests. The result cards still display, but the IMDb overlay
          is hidden for that broad result set because the app has not fetched
          Cloudflare IMDb ratings for those movies.
        */
        setHydratedMovies(titleSearchMovies);
        return;
      }

      setIsHydratingRatings(true);

      try {
        const moviesWithRatings = await hydrateMoviesWithCurrentImdbRatings(
          titleSearchMovies,
          false
        );

        if (isMounted) {
          setHydratedMovies(moviesWithRatings);
        }
      } finally {
        if (isMounted) {
          setIsHydratingRatings(false);
        }
      }
    }

    hydrateSearchResults();

    return () => {
      isMounted = false;
    };
  }, [data, shouldHydrateRatings, titleSearchMovies]);

  const isDetailOpen = isDetailStackOpen;
  const isLoadingResults = isLoading || isHydratingRatings;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screen}>
        {isDetailOpen ? null : (
          <View
            style={[
              styles.header,
              { paddingTop: insets.top + scaleSize(122) },
            ]}
          >
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
        )}

        <View style={styles.contentStack}>
          <View
            pointerEvents={isDetailOpen ? 'none' : 'auto'}
            accessibilityElementsHidden={isDetailOpen}
            importantForAccessibility={
              isDetailOpen ? 'no-hide-descendants' : 'auto'
            }
            style={[
              styles.resultsContent,
              isDetailOpen ? styles.resultsContentHidden : null,
            ]}
          >
            {isLoadingResults ? (
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
              </View>
            ) : (
              <MovieResults
                movies={movies}
                cardVariant="posterRating"
                showRatingBadge={shouldHydrateRatings}
                onMoviePress={pushMovie}
                onEndReached={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
          </View>

          <DetailStackOverlay
            detailStack={detailStack}
            onPopDetail={popDetail}
            onCloseAllDetails={closeAllDetails}
            onBackToOriginalMovie={backToOriginalMovie}
            onPushMovie={pushMovie}
            onPushPerson={pushPerson}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    minHeight: scaleSize(50),
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
    minHeight: scaleSize(48),
    ...typography.detailBody,
    color: colors.textPrimary,
    paddingVertical: 0,
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
  contentStack: {
    flex: 1,
  },
  resultsContent: {
    flex: 1,
  },
  resultsContentHidden: {
    opacity: 0,
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
});
