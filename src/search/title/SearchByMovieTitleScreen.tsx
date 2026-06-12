import React, { useMemo, useState } from 'react';
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
import { MovieResults } from '../results/MovieResults';
import { DetailStackOverlay } from '../../movie/DetailStackOverlay';
import { HeaderActionRow } from '../../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../../shared/header/HeaderNavButton';
import { getHeaderNavSecondaryTop } from '../../shared/header/headerNavMetrics';
import { useMovieTitleSearchQuery } from '../../hooks/useMovieSearchQuery';
import { useDetailStack } from '../../hooks/useDetailStack';
import { useTitleSearchRatings } from './useTitleSearchRatings';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import type { AppDrawerParamList } from '../../types/navigation/navigationTypes';

export function SearchByMovieTitleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const route = useRoute<RouteProp<AppDrawerParamList, 'SearchByMovieTitle'>>();
  const [draftTitle, setDraftTitle] = useState('');
  const [submittedTitle, setSubmittedTitle] = useState('');
  const {
    detailStack,
    isDetailStackOpen,
    pushMovie,
    pushPerson,
    popDetail,
    closeAllDetails,
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
  const { moviesWithRatings, resetRatingHydrationState } =
    useTitleSearchRatings(titleSearchMovies);

  function handleOpenAdvancedSearch() {
    navigation.navigate('AdvancedSearch');
  }

  function handleBackPress() {
    navigation.navigate(route.params?.returnTo ?? 'Home');
  }

  function handleSubmitSearch() {
    const nextSubmittedTitle = draftTitle.trim();

    closeAllDetails();
    resetRatingHydrationState();
    setSubmittedTitle(nextSubmittedTitle);
  }

  function handleClearTitle() {
    setDraftTitle('');
    setSubmittedTitle('');
    resetRatingHydrationState();
    closeAllDetails();
  }

  const isDetailOpen = isDetailStackOpen;
  const isLoadingResults = isLoading;

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
                movies={moviesWithRatings}
                cardVariant="posterRating"
                showRatingBadge
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
