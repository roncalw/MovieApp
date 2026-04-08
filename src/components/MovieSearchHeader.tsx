/*
Step: 6
   * /MovieApp/src/components/MovieSearchHeader.tsx
Called by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/components/MovieResultsList.tsx
Purpose:
   * Renders the search controls and query summary that appear above the shared movie results list on the search screen.
*/
import React from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';

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

type MovieSearchHeaderProps = {
  beginDate: string;
  endDate: string;
  selectedRating: string;
  selectedGenre: string;
  selectedStreamer: string;
  selectedSortValue: string;
  loadedPages: number;
  totalPages: number | null;
  movieSortBy: string;
  movieVoteCount: string;
  onBeginDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onStreamerChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
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
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MovieSearchHeader({
  beginDate,
  endDate,
  selectedRating,
  selectedGenre,
  selectedStreamer,
  selectedSortValue,
  loadedPages,
  totalPages,
  movieSortBy,
  movieVoteCount,
  onBeginDateChange,
  onEndDateChange,
  onRatingChange,
  onGenreChange,
  onStreamerChange,
  onSortChange,
}: MovieSearchHeaderProps) {
  return (
    <View>
      <Text style={styles.title}>Movie Search</Text>

      <SectionLabel>Begin Date (YYYY-MM-DD)</SectionLabel>
      <TextInput
        style={styles.input}
        value={beginDate}
        onChangeText={onBeginDateChange}
        placeholder="2024-01-01"
        autoCapitalize="none"
      />

      <SectionLabel>End Date (YYYY-MM-DD)</SectionLabel>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={onEndDateChange}
        placeholder="2024-12-31"
        autoCapitalize="none"
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
            onPress={() => onRatingChange(item.id)}
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
            selected={selectedGenre === item.value}
            onPress={() => onGenreChange(item.value)}
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
            selected={selectedStreamer === item.value}
            onPress={() => onStreamerChange(item.value)}
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
            onPress={() => onSortChange(item.value)}
          />
        ))}
      </ScrollView>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Query Summary</Text>
        <Text style={styles.summarySubText}>Rating: {selectedRating || 'Any'}</Text>
        <Text style={styles.summarySubText}>Genre: {selectedGenre || 'Any'}</Text>
        <Text style={styles.summarySubText}>Streamer: {selectedStreamer || 'Any'}</Text>
        <Text style={styles.summarySubText}>Sort By: {movieSortBy || 'TMDB default'}</Text>
        <Text style={styles.summarySubText}>Vote Count: {movieVoteCount || 'None'}</Text>
        <Text style={styles.summarySubText}>
          Pages Loaded: {loadedPages} of {totalPages ?? '-'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  rowWrap: {
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#68A1ED',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#68A1ED',
  },
  chipText: {
    color: '#68A1ED',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  summaryBox: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f4f6f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  summarySubText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
});
