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
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { GenreField } from '../ui/GenreField';
import { RatingField } from '../ui/RatingField';
import { SortField } from '../ui/SortField';
import { StreamerField } from '../ui/StreamerField';
import { YearWheelField } from '../ui/YearWheelField';
import {
  formatSelectedLabels,
  GENRE_ITEMS,
  getAppliedSortLabel,
  getInitialSortValue,
  STREAMER_ITEMS,
} from '../ui/movieSearchFieldUtils';
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

const TMDB_RESULTS_PER_PAGE = 20;
const MOVIE_COUNT_FORMATTER = new Intl.NumberFormat('en-US');

function getSortedValueSignature(values: string[]) {
  return [...values].sort().join('|');
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
  const [selectedStreamer, setSelectedStreamer] = useState(() => [
    ...appliedParams.movieStreamers,
  ]);
  const [selectedSortValue, setSelectedSortValue] = useState(() =>
    getInitialSortValue(appliedParams.movieSortBy, appliedParams.movieVoteCount)
  );
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

  const searchYears = useMemo(() => buildSearchYearOptions(), []);
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
            <GenreField
              value={selectedGenre}
              onChange={(nextValue) => setSelectedGenre(nextValue)}
            />
            <RatingField
              value={selectedRating}
              onChange={(nextValue) => setSelectedRating(nextValue)}
            />
          </View>

          <View style={styles.filterRow}>
            <StreamerField
              value={selectedStreamer}
              onChange={(nextValue) => setSelectedStreamer(nextValue)}
            />
            <SortField
              value={selectedSortValue}
              onChange={(nextValue) => setSelectedSortValue(nextValue)}
            />
          </View>

          <View style={styles.summaryBox}>
            <Pressable
              onPress={() => setIsSummaryCollapsed((currentValue) => !currentValue)}
              style={[
                styles.summaryHeaderRow,
                !isSummaryCollapsed && styles.summaryHeaderRowExpanded,
              ]}
            >
              <View style={styles.summaryHeaderInline}>
                <Text allowFontScaling={false} style={styles.summaryText}>
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
                  Sort By:{' '}
                  {getAppliedSortLabel(
                    appliedParams.movieSortBy,
                    appliedParams.movieVoteCount
                  )}
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
  dateFieldLabel: {
    color: colors.brandText,
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    marginTop: scaleSize(8),
    marginBottom: scaleSize(4),
    fontWeight: '400',
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
