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
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
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
  { label: 'Netflix', value: '8' },
  { label: 'Hulu', value: '15' },
  { label: 'Prime', value: '9' },
  { label: 'Max', value: '1899' },
  { label: 'YouTube', value: '192' },
  { label: 'Disney Plus', value: '337' },
  { label: 'Apple TV Plus', value: '350' },
  { label: 'Peacock', value: '387' },
  { label: 'AMC+', value: '526' },
  { label: 'Paramount+', value: '531' },
];

const SORT_ITEMS = [
  { id: '1', label: 'Popularity', value: '0' },
  { id: '2', label: 'User Rating (500+ Reviews)', value: '500' },
  { id: '3', label: 'User Rating (100+ Reviews)', value: '100' },
  { id: '4', label: 'User Rating (1+ Reviews)', value: '1' },
];

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text allowFontScaling={false} style={styles.sectionLabel}>
      {children}
    </Text>
  );
}

function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text
        allowFontScaling={false}
        style={[styles.chipText, selected && styles.chipTextSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
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

  return (
    SORT_ITEMS.find((item) => item.value === selectedSortValue)?.label ?? 'TMDB default'
  );
}

export function SubHeaderMovieSearchFields() {
  const {
    appliedParams,
    loadedPages,
    totalPages,
    onSubmitFilters,
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
  const searchYears = useMemo(() => buildSearchYearOptions(), []);

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
    registerSubmitHandler(submitFilters);

    return () => {
      registerSubmitHandler(null);
    };
  }, [registerSubmitHandler, submitFilters]);

  function toggleValue(currentValue: string, nextValue: string, onChange: (value: string) => void) {
    onChange(currentValue === nextValue ? '' : nextValue);
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
        <Text allowFontScaling={false} style={styles.visibilityToggleText}>
          {isFiltersVisible ? 'Hide Filter ^' : 'Show Filter >'}
        </Text>
      </Pressable>

      {!isFiltersVisible ? null : (
        <>
          <View style={styles.yearFieldsRow}>
            <View style={styles.yearFieldColumn}>
              <SectionLabel>Begin Year</SectionLabel>
              <YearWheelField
                title="Select Begin Year"
                value={beginYear}
                years={searchYears}
                onChange={setBeginYear}
              />
            </View>

            <View style={styles.yearFieldColumn}>
              <SectionLabel>End Year</SectionLabel>
              <YearWheelField
                title="Select End Year"
                value={endYear}
                years={searchYears}
                onChange={setEndYear}
              />
            </View>
          </View>

          {!isYearRangeInvalid ? null : (
            <Text allowFontScaling={false} style={styles.validationText}>
              Begin year cannot be later than end year.
            </Text>
          )}

          <SectionLabel>Rating</SectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowWrap}
          >
            {RATING_ITEMS.map((item) => (
              <SelectChip
                key={item.id}
                label={item.label}
                selected={selectedRating === item.id}
                onPress={() =>
                  toggleValue(selectedRating, item.id, setSelectedRating)
                }
              />
            ))}
          </ScrollView>

          <SectionLabel>Genre</SectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowWrap}
          >
            {GENRE_ITEMS.map((item) => (
              <SelectChip
                key={item.value}
                label={item.label}
                selected={selectedGenre.includes(item.value)}
                onPress={() =>
                  setSelectedGenre(toggleArrayValue(selectedGenre, item.value))
                }
              />
            ))}
          </ScrollView>

          <SectionLabel>Streamer</SectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowWrap}
          >
            {STREAMER_ITEMS.map((item) => (
              <SelectChip
                key={item.value}
                label={item.label}
                selected={selectedStreamer.includes(item.value)}
                onPress={() =>
                  setSelectedStreamer(
                    toggleArrayValue(selectedStreamer, item.value)
                  )
                }
              />
            ))}
          </ScrollView>

          <SectionLabel>Sort</SectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowWrap}
          >
            {SORT_ITEMS.map((item) => (
              <SelectChip
                key={item.id}
                label={item.label}
                selected={selectedSortValue === item.value}
                onPress={() =>
                  toggleValue(selectedSortValue, item.value, setSelectedSortValue)
                }
              />
            ))}
          </ScrollView>

          <View style={styles.summaryBox}>
            <Text allowFontScaling={false} style={styles.summaryText}>
              Query Summary
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              Begin Date: {appliedParams.beginDate}
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              End Date: {appliedParams.endDate}
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              Rating: {appliedParams.movieRatings || 'Any'}
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              Genre: {formatSelectedLabels(appliedParams.movieGenres, GENRE_ITEMS)}
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              Streamer: {formatSelectedLabels(appliedParams.movieStreamers, STREAMER_ITEMS)}
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              Sort By: {getAppliedSortLabel(appliedParams.movieSortBy, appliedParams.movieVoteCount)}
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              Vote Count: {appliedParams.movieVoteCount || 'None'}
            </Text>
            <Text allowFontScaling={false} style={styles.summarySubText}>
              Pages Loaded: {loadedPages} of {totalPages ?? '-'}
            </Text>
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
  sectionLabel: {
    ...typography.sectionLabel,
    marginTop: scaleSize(12),
    marginBottom: scaleSize(8),
    color: colors.brandText,
  },
  yearFieldsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scaleSize(12),
  },
  yearFieldColumn: {
    flex: 1,
  },
  rowWrap: {
    paddingBottom: scaleSize(4),
    gap: scaleSize(8),
  },
  chip: {
    minHeight: scaleSize(34),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(16),
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.background,
    marginRight: scaleSize(8),
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.chipBackgroundSelected,
  },
  chipText: {
    ...typography.chipLabel,
    color: colors.chipBorder,
  },
  chipTextSelected: {
    color: colors.actionOnPrimary,
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
    marginBottom: scaleSize(6),
    color: colors.brandText,
  },
  summarySubText: {
    ...typography.summaryBody,
    color: colors.textSecondary,
    marginBottom: scaleSize(2),
  },
  validationText: {
    ...typography.summaryBody,
    color: colors.brandText,
    marginTop: scaleSize(8),
    marginBottom: scaleSize(4),
  },
});
