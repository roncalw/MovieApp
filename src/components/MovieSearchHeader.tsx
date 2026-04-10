/*
Step: 6
   * /MovieApp/src/components/MovieSearchHeader.tsx
Imported by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/components/MovieResultsList.tsx
Purpose:
   * Renders the search controls and query summary that appear above the shared movie results list on the search screen.
*/
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';

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

type MovieSearchHeaderProps = {
  beginDate: string;
  endDate: string;
  selectedRating: string;
  selectedGenre: string[];
  selectedStreamer: string[];
  selectedSortValue: string;
  appliedRating: string;
  appliedGenre: string[];
  appliedStreamer: string[];
  appliedSortBy: string;
  appliedVoteCount: string;
  loadedPages: number;
  totalPages: number | null;
  onBeginDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onGenreChange: (value: string[]) => void;
  onStreamerChange: (value: string[]) => void;
  onSortChange: (value: string) => void;
};

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

export function MovieSearchHeader({
  beginDate,
  endDate,
  selectedRating,
  selectedGenre,
  selectedStreamer,
  selectedSortValue,
  appliedRating,
  appliedGenre,
  appliedStreamer,
  appliedSortBy,
  appliedVoteCount,
  loadedPages,
  totalPages,
  onBeginDateChange,
  onEndDateChange,
  onRatingChange,
  onGenreChange,
  onStreamerChange,
  onSortChange,
}: MovieSearchHeaderProps) {
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

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
      <SectionLabel>Begin Date (YYYY-MM-DD)</SectionLabel>
      <TextInput
        style={styles.input}
        value={beginDate}
        onChangeText={onBeginDateChange}
        placeholder="2024-01-01"
        autoCapitalize="none"
        allowFontScaling={false}
      />

      <SectionLabel>End Date (YYYY-MM-DD)</SectionLabel>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={onEndDateChange}
        placeholder="2024-12-31"
        autoCapitalize="none"
        allowFontScaling={false}
      />

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
              toggleValue(selectedRating, item.id, onRatingChange)
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
              onGenreChange(toggleArrayValue(selectedGenre, item.value))
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
              onStreamerChange(toggleArrayValue(selectedStreamer, item.value))
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
              toggleValue(selectedSortValue, item.value, onSortChange)
            }
          />
        ))}
      </ScrollView>

      <View style={styles.summaryBox}>
        <Text allowFontScaling={false} style={styles.summaryText}>
          Query Summary
        </Text>
        <Text allowFontScaling={false} style={styles.summarySubText}>
          Rating: {appliedRating || 'Any'}
        </Text>
        <Text allowFontScaling={false} style={styles.summarySubText}>
          Genre: {formatSelectedLabels(appliedGenre, GENRE_ITEMS)}
        </Text>
        <Text allowFontScaling={false} style={styles.summarySubText}>
          Streamer: {formatSelectedLabels(appliedStreamer, STREAMER_ITEMS)}
        </Text>
        <Text allowFontScaling={false} style={styles.summarySubText}>
          Sort By: {appliedSortBy || 'TMDB default'}
        </Text>
        <Text allowFontScaling={false} style={styles.summarySubText}>
          Vote Count: {appliedVoteCount || 'None'}
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
  input: {
    ...typography.inputText,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: scaleSize(8),
    minHeight: scaleSize(44),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(10),
    backgroundColor: colors.background,
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
});
