/*
Step: 6
   * /MovieApp/src/search/advanced/SubHeaderMovieSearchFields.tsx
Imported by:
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/search/results/MovieResults.tsx
Purpose:
   * Renders the movie-search field controls while reading and updating the shared header coordination from the parent
     header context.
*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { GenreField } from './fields/GenreField';
import { RatingField } from './fields/RatingField';
import { SortField } from './fields/SortField';
import { StreamerField } from './fields/StreamerField';
import { YearWheelField } from './fields/YearWheelField';
import {
  getInitialSortValue,
} from './fields/movieSearchFieldUtils';
import { colors } from '../../styles/colors';
import { scaleSize } from '../../theme/scale';
import { subHeaderMovieSearchFieldsStyles as styles } from '../../styles/search/subHeaderMovieSearchFieldsStyles';
import {
  buildSearchYearOptions,
  getBeginDateFromYear,
  getDefaultBeginYear,
  getDefaultEndYear,
  getEndDateFromYear,
  getYearFromDateString,
} from '../../utils/movieSearchDates';
import { useHeaderMovieSearchContext } from './HeaderMovieSearchContext';

function getSortedValueSignature(values: string[]) {
  return [...values].sort().join('|');
}

export function SubHeaderMovieSearchFields() {
  const {
    appliedParams,
    onSubmitFilters,
    onDisplayedFiltersDirtyChange,
    onValidityChange,
    registerSubmitHandler,
    excludeSeenMovies,
    onToggleExcludeSeenMovies,
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
          <Pressable
            onPress={onToggleExcludeSeenMovies}
            style={styles.excludeSeenToggle}
            accessibilityRole="button"
            accessibilityState={{ selected: excludeSeenMovies }}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.excludeSeenToggleText,
                excludeSeenMovies ? styles.excludeSeenToggleTextActive : null,
              ]}
            >
              Exclude Movies I Have Seen
            </Text>
          </Pressable>

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
        </>
      )}
    </View>
  );
}
