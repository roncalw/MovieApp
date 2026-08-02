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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { GenreField } from './fields/GenreField';
import { RatingField } from './fields/RatingField';
import { SortField } from './fields/SortField';
import { StreamerField } from './fields/StreamerField';
import { LanguageField } from './fields/LanguageField';
import { YearWheelField } from './fields/YearWheelField';
import { getInitialSortValue } from './fields/movieSearchFieldUtils';
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
import { useMovieLanguagesQuery } from '../../hooks/useMovieSearchQuery';

function getSortedValueSignature(values: string[]) {
  return [...values].sort().join('|');
}

export function SubHeaderMovieSearchFields() {
  const {
    appliedParams,
    pendingPresetRequestId,
    onSubmitFilters,
    onPresetFiltersReady,
    onDisplayedFiltersDirtyChange,
    onValidityChange,
    registerSubmitHandler,
    isFiltersVisible,
    onToggleFiltersVisibility,
    onFilterAreaTouchStart,
    onFilterPopupVisibilityChange,
    excludeSeenMovies,
    onToggleExcludeSeenMovies,
  } = useHeaderMovieSearchContext();

  const [beginYear, setBeginYear] = useState(() =>
    getYearFromDateString(appliedParams.beginDate, getDefaultBeginYear()),
  );
  const [endYear, setEndYear] = useState(() =>
    getYearFromDateString(appliedParams.endDate, getDefaultEndYear()),
  );
  const [selectedRating, setSelectedRating] = useState(
    appliedParams.movieRatings,
  );
  const [selectedGenre, setSelectedGenre] = useState(() => [
    ...appliedParams.movieGenres,
  ]);
  const [selectedStreamer, setSelectedStreamer] = useState(() => [
    ...appliedParams.movieStreamers,
  ]);
  const [selectedOriginalLanguages, setSelectedOriginalLanguages] = useState(
    () => [...appliedParams.movieOriginalLanguages],
  );
  const [selectedSortValue, setSelectedSortValue] = useState(() =>
    getInitialSortValue(
      appliedParams.movieSortBy,
      appliedParams.movieVoteCount,
    ),
  );
  const readyPresetRequestIdRef = useRef<string | null>(null);
  const movieLanguagesQuery = useMovieLanguagesQuery();
  const languageOptions = useMemo(
    () =>
      movieLanguagesQuery.data?.languages ?? [
        { code: 'en', englishName: 'English', nativeName: 'English' },
      ],
    [movieLanguagesQuery.data?.languages],
  );
  const excludeSeenToggleLabel = excludeSeenMovies
    ? 'Exclude movies you have seen? Yes'
    : 'Exclude movies you have seen? No';

  const searchYears = useMemo(() => buildSearchYearOptions(), []);
  const appliedGenreSignature = useMemo(
    () => getSortedValueSignature(appliedParams.movieGenres),
    [appliedParams.movieGenres],
  );
  const appliedStreamerSignature = useMemo(
    () => getSortedValueSignature(appliedParams.movieStreamers),
    [appliedParams.movieStreamers],
  );
  const appliedOriginalLanguageSignature = useMemo(
    () => getSortedValueSignature(appliedParams.movieOriginalLanguages),
    [appliedParams.movieOriginalLanguages],
  );
  const selectedGenreSignature = useMemo(
    () => getSortedValueSignature(selectedGenre),
    [selectedGenre],
  );
  const selectedStreamerSignature = useMemo(
    () => getSortedValueSignature(selectedStreamer),
    [selectedStreamer],
  );
  const selectedOriginalLanguageSignature = useMemo(
    () => getSortedValueSignature(selectedOriginalLanguages),
    [selectedOriginalLanguages],
  );

  useEffect(() => {
    setBeginYear(
      getYearFromDateString(appliedParams.beginDate, getDefaultBeginYear()),
    );
    setEndYear(
      getYearFromDateString(appliedParams.endDate, getDefaultEndYear()),
    );
    setSelectedRating(appliedParams.movieRatings);
    setSelectedGenre([...appliedParams.movieGenres]);
    setSelectedStreamer([...appliedParams.movieStreamers]);
    setSelectedOriginalLanguages([...appliedParams.movieOriginalLanguages]);
    setSelectedSortValue(
      getInitialSortValue(
        appliedParams.movieSortBy,
        appliedParams.movieVoteCount,
      ),
    );
  }, [
    appliedGenreSignature,
    appliedParams.beginDate,
    appliedParams.endDate,
    appliedParams.movieGenres,
    appliedParams.movieOriginalLanguages,
    appliedParams.movieRatings,
    appliedParams.movieSortBy,
    appliedParams.movieStreamers,
    appliedParams.movieVoteCount,
    appliedStreamerSignature,
    appliedOriginalLanguageSignature,
  ]);

  const displayedFiltersAreDirty = useMemo(
    () =>
      getBeginDateFromYear(beginYear) !== appliedParams.beginDate ||
      getEndDateFromYear(endYear) !== appliedParams.endDate ||
      selectedRating !== appliedParams.movieRatings ||
      selectedGenreSignature !== appliedGenreSignature ||
      selectedStreamerSignature !== appliedStreamerSignature ||
      selectedOriginalLanguageSignature !== appliedOriginalLanguageSignature ||
      selectedSortValue !==
        getInitialSortValue(
          appliedParams.movieSortBy,
          appliedParams.movieVoteCount,
        ),
    [
      appliedGenreSignature,
      appliedParams.beginDate,
      appliedParams.endDate,
      appliedParams.movieRatings,
      appliedOriginalLanguageSignature,
      appliedParams.movieSortBy,
      appliedParams.movieVoteCount,
      appliedStreamerSignature,
      beginYear,
      endYear,
      selectedGenreSignature,
      selectedRating,
      selectedOriginalLanguageSignature,
      selectedSortValue,
      selectedStreamerSignature,
    ],
  );

  const { movieVoteCount, movieSortBy } = useMemo(() => {
    let nextVoteCount = '';
    let nextSortBy = '';

    if (selectedSortValue === '') {
      nextVoteCount = '';
      nextSortBy = '';
    } else if (selectedSortValue === '0') {
      nextVoteCount = '';
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
      movieOriginalLanguages: selectedOriginalLanguages,
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
    selectedOriginalLanguages,
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

  useEffect(() => {
    if (
      !pendingPresetRequestId ||
      readyPresetRequestIdRef.current === pendingPresetRequestId ||
      displayedFiltersAreDirty ||
      isYearRangeInvalid
    ) {
      return;
    }

    let filterPaintFrameId: number | null = null;
    let submitFrameId: number | null = null;
    let isCancelled = false;

    /*
      The first frame lets React Native paint every selected preset value.
      Submitting on the following frame makes the query the final action in
      this navigation flow instead of racing the controls while they mount.
    */
    filterPaintFrameId = requestAnimationFrame(() => {
      submitFrameId = requestAnimationFrame(() => {
        if (isCancelled) {
          return;
        }

        readyPresetRequestIdRef.current = pendingPresetRequestId;
        onPresetFiltersReady(pendingPresetRequestId);
      });
    });

    return () => {
      isCancelled = true;
      if (filterPaintFrameId !== null) {
        cancelAnimationFrame(filterPaintFrameId);
      }
      if (submitFrameId !== null) {
        cancelAnimationFrame(submitFrameId);
      }
    };
  }, [
    displayedFiltersAreDirty,
    isYearRangeInvalid,
    onPresetFiltersReady,
    pendingPresetRequestId,
  ]);

  return (
    <View>
      <Pressable
        onPress={onToggleFiltersVisibility}
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
        <View
          testID="advanced-search-filter-fields-area"
          onTouchStart={onFilterAreaTouchStart}
        >
          <LanguageField
            value={selectedOriginalLanguages}
            onChange={setSelectedOriginalLanguages}
            languages={languageOptions}
            isLoading={movieLanguagesQuery.isLoading}
            isError={movieLanguagesQuery.isError}
            onRetry={() => {
              movieLanguagesQuery.refetch();
            }}
            onPopupVisibilityChange={onFilterPopupVisibilityChange}
          />

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
              {excludeSeenToggleLabel}
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
                onPopupVisibilityChange={onFilterPopupVisibilityChange}
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
                onPopupVisibilityChange={onFilterPopupVisibilityChange}
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
              onChange={nextValue => setSelectedGenre(nextValue)}
              onPopupVisibilityChange={onFilterPopupVisibilityChange}
            />
            <RatingField
              value={selectedRating}
              onChange={nextValue => setSelectedRating(nextValue)}
              onPopupVisibilityChange={onFilterPopupVisibilityChange}
            />
          </View>

          <View style={styles.filterRow}>
            <StreamerField
              value={selectedStreamer}
              onChange={nextValue => setSelectedStreamer(nextValue)}
              onPopupVisibilityChange={onFilterPopupVisibilityChange}
            />
            <SortField
              value={selectedSortValue}
              onChange={nextValue => setSelectedSortValue(nextValue)}
              onPopupVisibilityChange={onFilterPopupVisibilityChange}
            />
          </View>
        </View>
      )}
    </View>
  );
}
