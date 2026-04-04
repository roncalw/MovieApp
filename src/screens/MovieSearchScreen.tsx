import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useMovieSearchQuery } from '../hooks/queries/useMovieSearchQuery';
import type { movieType } from '../types/movie';

/*
  WHAT THIS CONSTANT DOES:
  - Provides the base image URL for TMDB poster images

  WHY THIS EXISTS HERE:
  - The screen renders the poster images
  - TMDB gives poster_path, not the full image URL
*/
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/*
  WHAT THESE CONSTANTS DO:
  - Provide the selector data for the UI controls at the top

  WHY THEY LIVE HERE FOR NOW:
  - You asked to hardcode the selector values for now
  - This keeps the page self-contained while the screen is still evolving
*/
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

const PAGE_ITEMS = Array.from({ length: 100 }, (_, index) => index + 1);

/*
  WHAT THIS COMPONENT DOES:
  - Renders a section heading for each control group

  WHY THIS EXISTS:
  - Keeps the main screen JSX cleaner
*/
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

/*
  WHAT THIS COMPONENT DOES:
  - Renders a simple selectable chip

  WHY THIS EXISTS:
  - You asked for selector-type controls at the top
  - This avoids adding extra UI packages right now
*/
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

/*
  WHAT THIS SCREEN DOES:
  - Replaces the old popular-movies page with a single movie search page
  - Shows filter controls at the top
  - Shows the results list underneath

  WHY THIS CHANGES:
  - You said this should be the page for now
  - No second page should be added
*/
export function MovieSearchScreen() {
  /*
    WHAT THESE STATE VALUES DO:
    - Hold the current filter selections for the query

    WHY THEY EXIST:
    - The page is now query-driven by user selections
  */
  const [selectedRating, setSelectedRating] = useState<string>('PG-13');
  const [selectedGenre, setSelectedGenre] = useState<string>('28');
  const [selectedStreamer, setSelectedStreamer] = useState<string>('8');
  const [selectedSortValue, setSelectedSortValue] = useState<string>('0');
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const [beginDate, setBeginDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');

  /*
    WHAT THIS useMemo DOES:
    - Converts the sort selector choice into:
        movieVoteCount
        movieSortBy

    WHY THIS EXISTS:
    - Your previous code used one radio selection to drive both values
    - This preserves that logic clearly in one place
  */
  const { movieVoteCount, movieSortBy } = useMemo(() => {
    let sortByForQuery = '';
    let voteCount = '0';

    if (selectedSortValue === '0') {
      voteCount = '0';
      sortByForQuery = 'popularity.desc';
    } else {
      voteCount = selectedSortValue;
      sortByForQuery = 'vote_average.desc';
    }

    return {
      movieVoteCount: voteCount,
      movieSortBy: sortByForQuery,
    };
  }, [selectedSortValue]);

  /*
    WHAT THIS useMemo DOES:
    - Builds the params object for the query hook

    WHY THIS EXISTS:
    - Keeps the query call clean
    - Matches the typed service input
  */
  const queryParams = useMemo(
    () => ({
      movieRatings: selectedRating,
      beginDate,
      endDate,
      movieGenres: selectedGenre,
      movieStreamers: selectedStreamer,
      movieVoteCount,
      movieSortBy,
      pageNum: selectedPage,
    }),
    [
      selectedRating,
      beginDate,
      endDate,
      selectedGenre,
      selectedStreamer,
      movieVoteCount,
      movieSortBy,
      selectedPage,
    ]
  );

  /*
    WHAT THIS HOOK CALL DOES:
    - Runs the query through TanStack Query

    WHY THIS EXISTS:
    - The screen should not call the API directly
    - The hook owns cache/loading/error behavior
  */
  const { data, isLoading, isError, error } = useMovieSearchQuery(queryParams);

  /*
    WHAT THIS HEADER DOES:
    - Builds the controls area that appears above the movie results

    WHY THIS IS USED AS ListHeaderComponent:
    - It keeps the entire page as one scrollable layout
  */
  const header = (
    <View>
      <Text style={styles.title}>Movie Search</Text>

      <SectionLabel>Begin Date (YYYY-MM-DD)</SectionLabel>
      <TextInput
        style={styles.input}
        value={beginDate}
        onChangeText={setBeginDate}
        placeholder="2024-01-01"
        autoCapitalize="none"
      />

      <SectionLabel>End Date (YYYY-MM-DD)</SectionLabel>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
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
            onPress={() => setSelectedRating(item.id)}
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
            onPress={() => setSelectedGenre(item.value)}
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
            onPress={() => setSelectedStreamer(item.value)}
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
            onPress={() => setSelectedSortValue(item.value)}
          />
        ))}
      </ScrollView>

      <SectionLabel>Page</SectionLabel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowWrap}
      >
        {PAGE_ITEMS.map((page) => (
          <SelectChip
            key={page}
            label={String(page)}
            selected={selectedPage === page}
            onPress={() => setSelectedPage(page)}
          />
        ))}
      </ScrollView>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Query Summary</Text>
        <Text style={styles.summarySubText}>Rating: {selectedRating}</Text>
        <Text style={styles.summarySubText}>Genre: {selectedGenre}</Text>
        <Text style={styles.summarySubText}>Streamer: {selectedStreamer}</Text>
        <Text style={styles.summarySubText}>Sort By: {movieSortBy}</Text>
        <Text style={styles.summarySubText}>Vote Count: {movieVoteCount}</Text>
        <Text style={styles.summarySubText}>Page: {selectedPage}</Text>
      </View>
    </View>
  );

  /*
    WHAT THIS DOES:
    - Shows the loading state during the query

    WHY:
    - The screen must handle loading explicitly
  */
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading movies...</Text>
      </View>
    );
  }

  /*
    WHAT THIS DOES:
    - Shows the error state if the query fails

    WHY:
    - A failed search should show a clear error instead of failing silently
  */
  if (isError) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading movies</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  /*
    WHAT THIS DOES:
    - Renders the full page:
        controls at top
        movie results underneath

    WHY:
    - This preserves the one-page layout you requested
  */
  return (
    <FlatList
      data={data}
      keyExtractor={(item: movieType) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={header}
      renderItem={({ item }: { item: movieType }) => (
        <View style={styles.card}>
          {item.poster_path ? (
            <Image
              source={{ uri: `${POSTER_BASE_URL}${item.poster_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : null}

          <Text style={styles.movieTitle}>{item.title}</Text>
          <Text style={styles.subText}>
            Release Date: {item.release_date}
          </Text>
          <Text style={styles.subText}>
            Rating: {item.vote_average} ({item.vote_count} votes)
          </Text>
          <Text style={styles.overview}>{item.overview}</Text>
        </View>
      )}
    />
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
  listContent: {
    padding: 16,
    backgroundColor: '#fff',
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
  card: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  poster: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  overview: {
    fontSize: 15,
    color: '#333',
    marginTop: 8,
    lineHeight: 21,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'red',
  },
});