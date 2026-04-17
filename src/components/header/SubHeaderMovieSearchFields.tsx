/*
Step: 6
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
Imported by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/components/body/MovieResults.tsx
Purpose:
   * Renders the movie-search field controls and query summary while reading and updating the shared header coordination from
     the parent header context.
*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Image } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { YearWheelField } from '../ui/YearWheelField';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import {
  buildSearchYearOptions,
  getBeginDateFromYear,
  getDefaultBeginYear,
  getDefaultEndYear,
  getEndDateFromYear,
  getYearFromDateString,
} from '../../utils/movieSearchDates';
import { useHeaderMovieSearchContext } from './HeaderMovieSearchContext';

const GENRE_ITEMS = [
  { label: 'Action', value: '28' },
  { label: 'Adventure', value: '12' },
  { label: 'Animation', value: '16' },
  { label: 'Comedy', value: '35' },
  { label: 'Crime', value: '80' },
  { label: 'Documentary', value: '99' },
  { label: 'Drama', value: '18' },
  { label: 'Family', value: '10751' },
  { label: 'Fantasy', value: '14' },
  { label: 'History', value: '36' },
  { label: 'Horror', value: '27' },
  { label: 'Music', value: '10402' },
  { label: 'Mystery', value: '9648' },
  { label: 'Romance', value: '10749' },
  { label: 'SciFi', value: '878' },
  { label: 'Thriller', value: '53' },
  { label: 'War', value: '10752' },
  { label: 'Western', value: '37' },
];

const RATING_ITEMS = [
  { id: 'G', label: 'G' },
  { id: 'PG', label: 'PG' },
  { id: 'PG-13', label: 'PG-13' },
  { id: 'R', label: 'R' },
];

const STREAMER_ITEMS = [
  { label: 'Netflix', value: '8', image: require('../../assets/images/netflix.png') },
  { label: 'Hulu', value: '15', image: require('../../assets/images/hulu.png') },
  { label: 'Prime', value: '9', image: require('../../assets/images/amazon_prime.png') },
  { label: 'Max', value: '1899', image: require('../../assets/images/max.png') },
  { label: 'YouTube', value: '192', image: require('../../assets/images/youtube_premium.png') },
  { label: 'Disney Plus', value: '337', image: require('../../assets/images/disney_plus.png') },
  { label: 'Apple TV Plus', value: '350', image: require('../../assets/images/apple_tv_plus.png') },
  { label: 'Peacock', value: '387', image: require('../../assets/images/peacock.png') },
  { label: 'AMC+', value: '526', image: require('../../assets/images/amc.png') },
  { label: 'Paramount+', value: '531', image: require('../../assets/images/paramount_plus.png') },
];

const SORT_ITEMS = [
  { id: '1', label: 'Popularity', value: '0' },
  { id: '2', label: 'User Rating (500+ Reviews)', value: '500' },
  { id: '3', label: 'User Rating (100+ Reviews)', value: '100' },
  { id: '4', label: 'User Rating (1+ Reviews)', value: '1' },
];

const TMDB_RESULTS_PER_PAGE = 20;
const MOVIE_COUNT_FORMATTER = new Intl.NumberFormat('en-US');

function getSortedValueSignature(values: string[]) {
  return [...values].sort().join('|');
}

function formatSelectedLabels(
  selectedValues: string[],
  items: Array<{ label: string; value: string }>
) {
  if (selectedValues.length === 0) {
    return 'Any';
  }

  return items
    .filter((item) => selectedValues.includes(item.value))
    .map((item) => item.label)
    .join(', ');
}

function toggleArrayValue(currentValues: string[], nextValue: string) {
  if (currentValues.includes(nextValue)) {
    return currentValues.filter((value) => value !== nextValue);
  }

  return [...currentValues, nextValue];
}

function getInitialSortValue(appliedSortBy: string, appliedVoteCount: string) {
  if (appliedSortBy === 'popularity.desc' && appliedVoteCount === '0') {
    return '0';
  }

  if (appliedSortBy === 'vote_average.desc') {
    return appliedVoteCount;
  }

  return '';
}

function getAppliedSortLabel(appliedSortBy: string, appliedVoteCount: string) {
  const selectedSortValue = getInitialSortValue(appliedSortBy, appliedVoteCount);

  return SORT_ITEMS.find((item) => item.value === selectedSortValue)?.label ?? 'Popular';
}

function formatInlineSummary(
  selectedValues: string[],
  items: Array<{ label: string; value: string }>
) {
  if (selectedValues.length === 0) {
    return '';
  }

  return items
    .filter((item) => selectedValues.includes(item.value))
    .map((item) => item.label)
    .sort()
    .join(' | ');
}

function FilterTrigger({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.filterColumn}>
      <Pressable onPress={onPress} style={styles.filterTrigger}>
        <Text allowFontScaling={false} style={styles.filterTriggerText}>
          {label} {'>'}
        </Text>
      </Pressable>

      <View style={styles.filterValueBox}>
        <Text
          allowFontScaling={false}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.filterValueText}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function PopupChip({
  label,
  selected,
  onPress,
  reversedSelectionAppearance = false,
  fixedWidth = false,
  subtleBorder = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  reversedSelectionAppearance?: boolean;
  fixedWidth?: boolean;
  subtleBorder?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.popupChip,
        fixedWidth && styles.popupChipFixedWidth,
        subtleBorder && styles.popupChipSubtleBorder,
        reversedSelectionAppearance && styles.popupChipReversed,
        selected && styles.popupChipSelected,
        selected && subtleBorder && styles.popupChipSubtleBorderSelected,
        selected && reversedSelectionAppearance && styles.popupChipSelectedReversed,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.popupChipText,
          reversedSelectionAppearance && styles.popupChipTextReversed,
          selected && styles.popupChipTextSelected,
          selected &&
            reversedSelectionAppearance &&
            styles.popupChipTextSelectedReversed,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StreamerTile({
  label,
  source,
  selected,
  onPress,
}: {
  label: string;
  source: ReturnType<typeof require>;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.streamerTile, selected && styles.streamerTileSelected]}
    >
      <Image source={source} style={styles.streamerLogo} resizeMode="contain" />
    </Pressable>
  );
}

export function SubHeaderMovieSearchFields() {
  const {
    appliedParams,
    totalPages,
    onSubmitFilters,
    onDisplayedFiltersDirtyChange,
    onValidityChange,
    registerSubmitHandler,
  } = useHeaderMovieSearchContext();

  const [beginYear, setBeginYear] = useState(() =>
    getYearFromDateString(appliedParams.beginDate, getDefaultBeginYear())
  );
  const [endYear, setEndYear] = useState(() =>
    getYearFromDateString(appliedParams.endDate, getDefaultEndYear())
  );
  const [selectedRating, setSelectedRating] = useState(appliedParams.movieRatings);
  const [selectedGenre, setSelectedGenre] = useState(() => [...appliedParams.movieGenres]);
  const [draftGenre, setDraftGenre] = useState(() => [...appliedParams.movieGenres]);
  const [selectedGenreSnapshot, setSelectedGenreSnapshot] = useState(() => [
    ...appliedParams.movieGenres,
  ]);
  const [isGenreModalVisible, setIsGenreModalVisible] = useState(false);
  const [selectedStreamer, setSelectedStreamer] = useState(() => [
    ...appliedParams.movieStreamers,
  ]);
  const [draftStreamer, setDraftStreamer] = useState(() => [
    ...appliedParams.movieStreamers,
  ]);
  const [selectedStreamerSnapshot, setSelectedStreamerSnapshot] = useState(() => [
    ...appliedParams.movieStreamers,
  ]);
  const [isStreamerModalVisible, setIsStreamerModalVisible] = useState(false);
  const [selectedSortValue, setSelectedSortValue] = useState(() =>
    getInitialSortValue(appliedParams.movieSortBy, appliedParams.movieVoteCount)
  );
  const [draftSortValue, setDraftSortValue] = useState(() =>
    getInitialSortValue(appliedParams.movieSortBy, appliedParams.movieVoteCount)
  );
  const [selectedSortValueSnapshot, setSelectedSortValueSnapshot] = useState(() =>
    getInitialSortValue(appliedParams.movieSortBy, appliedParams.movieVoteCount)
  );
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [draftRating, setDraftRating] = useState(appliedParams.movieRatings);
  const [selectedRatingSnapshot, setSelectedRatingSnapshot] = useState(
    appliedParams.movieRatings
  );
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const searchYears = useMemo(() => buildSearchYearOptions(), []);
  const selectedGenreSummary = useMemo(
    () => formatInlineSummary(selectedGenre, GENRE_ITEMS),
    [selectedGenre]
  );
  const selectedRatingSummary = selectedRating || '';
  const selectedStreamerSummary = useMemo(
    () => formatInlineSummary(selectedStreamer, STREAMER_ITEMS),
    [selectedStreamer]
  );
  const selectedSortSummary = useMemo(
    () => SORT_ITEMS.find((item) => item.value === selectedSortValue)?.label ?? '',
    [selectedSortValue]
  );
  const estimatedMovieCount = (totalPages ?? 0) * TMDB_RESULTS_PER_PAGE;
  const appliedGenreSignature = useMemo(
    () => getSortedValueSignature(appliedParams.movieGenres),
    [appliedParams.movieGenres]
  );
  const appliedStreamerSignature = useMemo(
    () => getSortedValueSignature(appliedParams.movieStreamers),
    [appliedParams.movieStreamers]
  );
  const selectedGenreSignature = useMemo(
    () => getSortedValueSignature(selectedGenre),
    [selectedGenre]
  );
  const selectedStreamerSignature = useMemo(
    () => getSortedValueSignature(selectedStreamer),
    [selectedStreamer]
  );
  const displayedFiltersAreDirty = useMemo(
    () =>
      getBeginDateFromYear(beginYear) !== appliedParams.beginDate ||
      getEndDateFromYear(endYear) !== appliedParams.endDate ||
      selectedRating !== appliedParams.movieRatings ||
      selectedGenreSignature !== appliedGenreSignature ||
      selectedStreamerSignature !== appliedStreamerSignature ||
      selectedSortValue !==
        getInitialSortValue(appliedParams.movieSortBy, appliedParams.movieVoteCount),
    [
      appliedGenreSignature,
      appliedParams.beginDate,
      appliedParams.endDate,
      appliedParams.movieRatings,
      appliedParams.movieSortBy,
      appliedParams.movieVoteCount,
      appliedStreamerSignature,
      beginYear,
      endYear,
      selectedGenreSignature,
      selectedRating,
      selectedSortValue,
      selectedStreamerSignature,
    ]
  );

  const { movieVoteCount, movieSortBy } = useMemo(() => {
    let nextVoteCount = '';
    let nextSortBy = '';

    if (selectedSortValue === '') {
      nextVoteCount = '';
      nextSortBy = '';
    } else if (selectedSortValue === '0') {
      nextVoteCount = '0';
      nextSortBy = 'popularity.desc';
    } else {
      nextVoteCount = selectedSortValue;
      nextSortBy = 'vote_average.desc';
    }

    return {
      movieVoteCount: nextVoteCount,
      movieSortBy: nextSortBy,
    };
  }, [selectedSortValue]);
  const isYearRangeInvalid = beginYear > endYear;

  const submitFilters = useCallback(() => {
    if (beginYear > endYear) {
      return;
    }

    onSubmitFilters({
      movieRatings: selectedRating,
      beginDate: getBeginDateFromYear(beginYear),
      endDate: getEndDateFromYear(endYear),
      movieGenres: selectedGenre,
      movieStreamers: selectedStreamer,
      movieVoteCount,
      movieSortBy,
    });
  }, [
    beginYear,
    endYear,
    movieSortBy,
    movieVoteCount,
    onSubmitFilters,
    selectedGenre,
    selectedRating,
    selectedStreamer,
  ]);

  useEffect(() => {
    onValidityChange(isYearRangeInvalid);
  }, [isYearRangeInvalid, onValidityChange]);

  useEffect(() => {
    onDisplayedFiltersDirtyChange(displayedFiltersAreDirty);
  }, [displayedFiltersAreDirty, onDisplayedFiltersDirtyChange]);

  useEffect(() => {
    registerSubmitHandler(submitFilters);

    return () => {
      registerSubmitHandler(null);
    };
  }, [registerSubmitHandler, submitFilters]);

  function openGenreModal() {
    setDraftGenre([...selectedGenre]);
    setSelectedGenreSnapshot([...selectedGenre]);
    setIsGenreModalVisible(true);
  }

  function closeGenreModal() {
    setSelectedGenre([...draftGenre]);
    setIsGenreModalVisible(false);
  }

  function cancelGenreModal() {
    setDraftGenre([...selectedGenreSnapshot]);
    setSelectedGenre([...selectedGenreSnapshot]);
    setIsGenreModalVisible(false);
  }

  function toggleDraftGenre(nextValue: string) {
    setDraftGenre((currentValue) => toggleArrayValue(currentValue, nextValue));
  }

  function openRatingModal() {
    setDraftRating(selectedRating);
    setSelectedRatingSnapshot(selectedRating);
    setIsRatingModalVisible(true);
  }

  function closeRatingModal() {
    setSelectedRating(draftRating);
    setIsRatingModalVisible(false);
  }

  function cancelRatingModal() {
    setDraftRating(selectedRatingSnapshot);
    setSelectedRating(selectedRatingSnapshot);
    setIsRatingModalVisible(false);
  }

  function toggleDraftRating(nextValue: string) {
    setDraftRating((currentValue) => (currentValue === nextValue ? '' : nextValue));
  }

  function openStreamerModal() {
    setDraftStreamer([...selectedStreamer]);
    setSelectedStreamerSnapshot([...selectedStreamer]);
    setIsStreamerModalVisible(true);
  }

  function closeStreamerModal() {
    setSelectedStreamer([...draftStreamer]);
    setIsStreamerModalVisible(false);
  }

  function cancelStreamerModal() {
    setDraftStreamer([...selectedStreamerSnapshot]);
    setSelectedStreamer([...selectedStreamerSnapshot]);
    setIsStreamerModalVisible(false);
  }

  function toggleDraftStreamer(nextValue: string) {
    setDraftStreamer((currentValue) => toggleArrayValue(currentValue, nextValue));
  }

  function openSortModal() {
    setDraftSortValue(selectedSortValue);
    setSelectedSortValueSnapshot(selectedSortValue);
    setIsSortModalVisible(true);
  }

  function closeSortModal() {
    setSelectedSortValue(draftSortValue);
    setIsSortModalVisible(false);
  }

  function cancelSortModal() {
    setDraftSortValue(selectedSortValueSnapshot);
    setSelectedSortValue(selectedSortValueSnapshot);
    setIsSortModalVisible(false);
  }

  function toggleDraftSortValue(nextValue: string) {
    setDraftSortValue((currentValue) => (currentValue === nextValue ? '' : nextValue));
  }

  return (
    <View>
      <Pressable
        onPress={() => setIsFiltersVisible((currentValue) => !currentValue)}
        style={styles.visibilityToggle}
      >
        {/*
          Lock the filter-header labels to the shared typography tokens so
          Android and iPhone do not drift apart by applying different device
          font scaling on top of the chosen UI sizes.
        */}
        <View style={styles.visibilityToggleRow}>
          <Text allowFontScaling={false} style={styles.visibilityToggleText}>
            {isFiltersVisible ? 'Hide Filter' : 'Show Filter'}
          </Text>
          <Ionicons
            name={isFiltersVisible ? 'chevron-up' : 'chevron-down'}
            size={scaleSize(26)}
            color={colors.brandText}
          />
        </View>
      </Pressable>

      {!isFiltersVisible ? null : (
        <>
          <View style={styles.yearFieldsRow}>
            <View style={styles.yearFieldColumn}>
              <Text allowFontScaling={false} style={styles.dateFieldLabel}>
                Released
              </Text>
              <YearWheelField
                title="Select Begin Year"
                value={beginYear}
                years={searchYears}
                onChange={setBeginYear}
                variant="anchoredDate"
                dateRole="begin"
              />
            </View>

            <View style={styles.yearFieldColumn}>
              <Text allowFontScaling={false} style={styles.dateFieldLabel}>
                To
              </Text>
              <YearWheelField
                title="Select End Year"
                value={endYear}
                years={searchYears}
                onChange={setEndYear}
                variant="anchoredDate"
                dateRole="end"
              />
            </View>
          </View>

          {!isYearRangeInvalid ? null : (
            <Text allowFontScaling={false} style={styles.validationText}>
              Begin year cannot be later than end year.
            </Text>
          )}

          <View style={styles.filterRow}>
            <FilterTrigger
              label="Genre"
              value={selectedGenreSummary}
              onPress={openGenreModal}
            />

            <FilterTrigger
              label="Rating"
              value={selectedRatingSummary}
              onPress={openRatingModal}
            />
          </View>

          <View style={styles.filterRow}>
            <FilterTrigger
              label="Streaming"
              value={selectedStreamerSummary}
              onPress={openStreamerModal}
            />

            <FilterTrigger
              label="Sort"
              value={selectedSortSummary}
              onPress={openSortModal}
            />
          </View>

          <Modal
            transparent
            visible={isGenreModalVisible}
            animationType="fade"
            onRequestClose={closeGenreModal}
          >
            <View style={styles.modalRoot}>
              <Pressable style={styles.modalBackdrop} onPress={closeGenreModal} />

              <View style={styles.selectionModalCard}>
                <Text allowFontScaling={false} style={styles.selectionModalTitle}>
                  Search by Genre(s)
                </Text>

                <View style={styles.selectionChipGroup}>
                  {GENRE_ITEMS.map((item) => (
                    <PopupChip
                      key={item.value}
                      label={item.label}
                      selected={draftGenre.includes(item.value)}
                      onPress={() => toggleDraftGenre(item.value)}
                      reversedSelectionAppearance
                      subtleBorder
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={cancelGenreModal}
                  style={styles.modalSecondaryButton}
                >
                  <Text
                    allowFontScaling={false}
                    style={styles.modalSecondaryButtonText}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={closeGenreModal} style={styles.modalPrimaryButton}>
                  <Text
                    allowFontScaling={false}
                    style={styles.modalPrimaryButtonText}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal
            transparent
            visible={isRatingModalVisible}
            animationType="fade"
            onRequestClose={closeRatingModal}
          >
            <View style={styles.modalRoot}>
              <Pressable style={styles.modalBackdrop} onPress={closeRatingModal} />

              <View style={styles.ratingModalCard}>
                <Text allowFontScaling={false} style={styles.selectionModalTitle}>
                  Search by Rating(s)
                </Text>

                <View style={styles.ratingChipGroup}>
                  {RATING_ITEMS.map((item) => (
                    <PopupChip
                      key={item.id}
                      label={item.label}
                      selected={draftRating === item.id}
                      onPress={() => toggleDraftRating(item.id)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={cancelRatingModal}
                  style={styles.modalSecondaryButton}
                >
                  <Text
                    allowFontScaling={false}
                    style={styles.modalSecondaryButtonText}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={closeRatingModal} style={styles.modalPrimaryButton}>
                  <Text
                    allowFontScaling={false}
                    style={styles.modalPrimaryButtonText}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal
            transparent
            visible={isStreamerModalVisible}
            animationType="fade"
            onRequestClose={closeStreamerModal}
          >
            <View style={styles.modalRoot}>
              <Pressable style={styles.modalBackdrop} onPress={closeStreamerModal} />

              <View style={styles.selectionModalCard}>
                <Text allowFontScaling={false} style={styles.selectionModalTitle}>
                  Search by Streamer(s)
                </Text>

                <View style={styles.streamerTileGroup}>
                  {STREAMER_ITEMS.map((item) => (
                    <StreamerTile
                      key={item.value}
                      label={item.label}
                      source={item.image}
                      selected={draftStreamer.includes(item.value)}
                      onPress={() => toggleDraftStreamer(item.value)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={cancelStreamerModal}
                  style={styles.modalSecondaryButton}
                >
                  <Text
                    allowFontScaling={false}
                    style={styles.modalSecondaryButtonText}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={closeStreamerModal} style={styles.modalPrimaryButton}>
                  <Text
                    allowFontScaling={false}
                    style={styles.modalPrimaryButtonText}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal
            transparent
            visible={isSortModalVisible}
            animationType="fade"
            onRequestClose={closeSortModal}
          >
            <View style={styles.modalRoot}>
              <Pressable style={styles.modalBackdrop} onPress={closeSortModal} />

              <View style={styles.sortModalCard}>
                <Text allowFontScaling={false} style={styles.selectionModalTitle}>
                  Sort By Popularity or User Rating
                </Text>

                <View style={styles.sortChipGroup}>
                  {SORT_ITEMS.map((item) => (
                    <PopupChip
                      key={item.id}
                      label={item.label}
                      selected={draftSortValue === item.value}
                      onPress={() => toggleDraftSortValue(item.value)}
                      fixedWidth
                      reversedSelectionAppearance
                      subtleBorder
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={cancelSortModal}
                  style={styles.modalSecondaryButton}
                >
                  <Text
                    allowFontScaling={false}
                    style={styles.modalSecondaryButtonText}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={closeSortModal} style={styles.modalPrimaryButton}>
                  <Text
                    allowFontScaling={false}
                    style={styles.modalPrimaryButtonText}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <View style={styles.summaryBox}>
            <Pressable
              onPress={() => setIsSummaryCollapsed((currentValue) => !currentValue)}
              style={[
                styles.summaryHeaderRow,
                !isSummaryCollapsed && styles.summaryHeaderRowExpanded,
              ]}
            >
              <View style={styles.summaryHeaderInline}>
                <Text
                  allowFontScaling={false}
                  style={styles.summaryText}
                >
                  Movie Search Summary
                </Text>
                <Ionicons
                  name={isSummaryCollapsed ? 'chevron-down' : 'chevron-up'}
                  size={scaleSize(24)}
                  color={colors.brandText}
                />
              </View>
            </Pressable>

            {isSummaryCollapsed ? null : (
              <>
                <Text allowFontScaling={false} style={styles.summarySubText}>
                  Released: {getYearFromDateString(appliedParams.beginDate, getDefaultBeginYear())}{' '}
                  to {getYearFromDateString(appliedParams.endDate, getDefaultEndYear())}
                </Text>
                <Text allowFontScaling={false} style={styles.summarySubText}>
                  Genre: {formatSelectedLabels(appliedParams.movieGenres, GENRE_ITEMS)}
                </Text>
                <Text allowFontScaling={false} style={styles.summarySubText}>
                  Rating: {appliedParams.movieRatings || 'Any'}
                </Text>
                <Text allowFontScaling={false} style={styles.summarySubText}>
                  Streaming On:{' '}
                  {formatSelectedLabels(appliedParams.movieStreamers, STREAMER_ITEMS)}
                </Text>
                <Text allowFontScaling={false} style={styles.summarySubText}>
                  Sort By: {getAppliedSortLabel(appliedParams.movieSortBy, appliedParams.movieVoteCount)}
                </Text>
                <Text allowFontScaling={false} style={styles.summarySubTextSpaced}>
                  Movies Found: {MOVIE_COUNT_FORMATTER.format(estimatedMovieCount)}
                </Text>
                {estimatedMovieCount === 0 ? (
                  <Text allowFontScaling={false} style={styles.summarySubTextItalic}>
                    Submit New Search
                  </Text>
                ) : null}
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  visibilityToggle: {
    /*
      scaleSize(...) drives the spacing and control heights in this filter area
      so inputs, chips, and summary spacing compress on narrow phones but keep
      the same overall design system.
    */
    alignSelf: 'center',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    marginBottom: scaleSize(6),
  },
  visibilityToggleText: {
    ...typography.visibilityToggle,
    color: colors.brandText,
  },
  visibilityToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
  },
  yearFieldsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scaleSize(12),
  },
  yearFieldColumn: {
    flex: 1,
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scaleSize(8),
    marginBottom: scaleSize(6),
  },
  filterColumn: {
    flex: 1,
    alignItems: 'center',
  },
  filterTrigger: {
    justifyContent: 'center',
    minHeight: scaleSize(32),
    marginBottom: 0,
  },
  filterTriggerText: {
    color: '#771F14',
    textAlign: 'center',
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    fontWeight: '400',
  },
  filterValueBox: {
    width: scaleSize(150),
    minHeight: scaleSize(28),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(4),
  },
  filterValueText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: scaleSize(14),
    lineHeight: scaleSize(18),
  },
  dateFieldLabel: {
    color: colors.brandText,
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    marginTop: scaleSize(8),
    marginBottom: scaleSize(4),
    fontWeight: '400',
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: scaleSize(150),
    paddingHorizontal: scaleSize(12),
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  selectionModalCard: {
    width: '100%',
    maxWidth: scaleSize(400),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#771F14',
    borderRadius: scaleSize(30),
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
    paddingTop: scaleSize(8),
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(10),
  },
  ratingModalCard: {
    width: '100%',
    maxWidth: scaleSize(320),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#771F14',
    borderRadius: scaleSize(30),
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
    paddingTop: scaleSize(8),
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(14),
  },
  selectionModalTitle: {
    color: '#771F14',
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    marginBottom: scaleSize(6),
    marginTop: scaleSize(2),
  },
  selectionChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(4),
    gap: scaleSize(6),
  },
  ratingChipGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(8),
    paddingTop: scaleSize(8),
  },
  streamerTileGroup: {
    width: '100%',
    maxWidth: scaleSize(350),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(6),
    paddingHorizontal: scaleSize(4),
  },
  sortModalCard: {
    width: '100%',
    maxWidth: scaleSize(400),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#771F14',
    borderRadius: scaleSize(30),
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
    paddingTop: scaleSize(12),
    paddingHorizontal: scaleSize(14),
    paddingBottom: scaleSize(14),
  },
  sortChipGroup: {
    width: '100%',
    gap: scaleSize(8),
    paddingTop: scaleSize(4),
  },
  streamerTile: {
    minWidth: scaleSize(78),
    minHeight: scaleSize(42),
    paddingHorizontal: scaleSize(4),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamerTileSelected: {
    backgroundColor: 'red',
  },
  streamerLogo: {
    width: scaleSize(70),
    height: scaleSize(35),
  },
  popupChip: {
    minHeight: scaleSize(34),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(10),
    backgroundColor: '#D9BC84',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupChipFixedWidth: {
    alignSelf: 'center',
    width: scaleSize(230),
  },
  popupChipSubtleBorder: {
    borderWidth: 1,
    borderColor: 'rgba(119, 31, 20, 0.12)',
  },
  popupChipSubtleBorderSelected: {
    borderColor: 'rgba(119, 31, 20, 0.18)',
  },
  popupChipSelected: {
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
  },
  popupChipReversed: {
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
  },
  popupChipSelectedReversed: {
    backgroundColor: '#D9BC84',
  },
  popupChipText: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    textAlign: 'center',
  },
  popupChipTextSelected: {
    color: '#777777',
  },
  popupChipTextReversed: {
    color: '#777777',
  },
  popupChipTextSelectedReversed: {
    color: colors.textPrimary,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(12),
    marginTop: scaleSize(12),
  },
  modalPrimaryButton: {
    alignSelf: 'center',
    height: scaleSize(40),
    width: scaleSize(120),
    backgroundColor: '#F8EBCE',
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#771F14',
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  modalSecondaryButton: {
    alignSelf: 'center',
    height: scaleSize(40),
    width: scaleSize(120),
    backgroundColor: '#F8EBCE',
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#771F14',
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  modalPrimaryButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
  },
  modalSecondaryButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
  },
  summaryBox: {
    marginTop: scaleSize(16),
    marginBottom: scaleSize(8),
    padding: scaleSize(12),
    borderRadius: scaleSize(10),
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  summaryText: {
    ...typography.summaryTitle,
    color: colors.brandText,
  },
  summaryHeaderRow: {
    alignSelf: 'flex-start',
  },
  summaryHeaderRowExpanded: {
    marginBottom: scaleSize(6),
  },
  summaryHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  summarySubText: {
    ...typography.summaryBody,
    color: colors.textSecondary,
    marginBottom: scaleSize(2),
  },
  summarySubTextSpaced: {
    ...typography.summaryBody,
    color: colors.textSecondary,
    marginTop: scaleSize(12),
    marginBottom: scaleSize(2),
  },
  summarySubTextItalic: {
    ...typography.summaryBody,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: scaleSize(2),
  },
  validationText: {
    ...typography.summaryBody,
    color: colors.brandText,
    textAlign: 'center',
    marginTop: scaleSize(8),
    marginBottom: scaleSize(4),
  },
});
