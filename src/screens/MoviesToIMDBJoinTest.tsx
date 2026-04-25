import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';
import { tmdbClient } from '../api/tmdb/client';
import { CONFIG } from '../api/tmdb/config';
import { ENDPOINTS } from '../api/tmdb/endpoints';
import type { movieType } from '../types/MovieTypes';
import {
  getDefaultBeginDate,
  getDefaultEndDate,
} from '../utils/movieSearchDates';
import type { MovieSearchParams } from '../types/movieSearchParams';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { fetchMovieSearchResults } from '../api/tmdb/services/movieService';

const OMDB_API_URL = 'https://www.omdbapi.com';
const OMDB_API_KEY = 'apikey=77bdf9d5';
const MAX_JOIN_CONCURRENCY = 4;
const TEST_PAGES = [1, 2, 3, 4, 5];

type TmdbExternalIdsResponse = {
  id: number;
  imdb_id: string | null;
};

type OmdbMovieResponse = {
  Response?: string;
  Error?: string;
  imdbID?: string;
  imdbRating?: string;
  imdbVotes?: string;
};

type JoinedMovieRow = {
  id: number;
  title: string;
  imdbID: string;
  imdbRating: string;
  imdbVotes: string;
};

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

async function fetchTestSearchPage(pageNum: number) {
  const defaultParams: MovieSearchParams = {
    movieRatings: '',
    beginDate: getDefaultBeginDate(),
    endDate: getDefaultEndDate(),
    movieGenres: [],
    movieStreamers: [],
    movieVoteCount: '',
    movieSortBy: '',
  };

  return fetchMovieSearchResults(defaultParams, pageNum);
}

async function fetchImdbIdForMovie(tmdbMovieId: number) {
  const response = await tmdbClient.get<TmdbExternalIdsResponse>(
    `${ENDPOINTS.MOVIE_DETAILS}/${tmdbMovieId}/external_ids?${CONFIG.apiKey}`
  );

  return response.data.imdb_id ?? '';
}

async function fetchOmdbRating(imdbID: string) {
  if (!imdbID) {
    return {
      imdbID: '',
      imdbRating: 'No IMDb ID',
      imdbVotes: 'No IMDb ID',
    };
  }

  const response = await axios.get<OmdbMovieResponse>(
    `${OMDB_API_URL}/?i=${imdbID}&${OMDB_API_KEY}`
  );

  const data = response.data;

  return {
    imdbID,
    imdbRating:
      data.Response === 'False' || !data.imdbRating || data.imdbRating === 'N/A'
        ? 'No Data'
        : data.imdbRating,
    imdbVotes:
      data.Response === 'False' || !data.imdbVotes || data.imdbVotes === 'N/A'
        ? 'No Data'
        : data.imdbVotes,
  };
}

async function buildJoinedRows(
  movies: movieType[],
  onProgress: (completed: number, total: number) => void
) {
  const batches = chunkArray(movies, MAX_JOIN_CONCURRENCY);
  const total = movies.length;
  let completed = 0;
  const joinedRows: JoinedMovieRow[] = [];

  for (const batch of batches) {
    const batchRows = await Promise.all(
      batch.map(async (movie) => {
        const imdbID = await fetchImdbIdForMovie(movie.id);
        const imdbData = await fetchOmdbRating(imdbID);

        return {
          id: movie.id,
          title: movie.title,
          imdbID: imdbData.imdbID,
          imdbRating: imdbData.imdbRating,
          imdbVotes: imdbData.imdbVotes,
        };
      })
    );

    joinedRows.push(...batchRows);
    completed += batch.length;
    onProgress(completed, total);
  }

  return joinedRows;
}

export function MoviesToIMDBJoinTest() {
  const [rows, setRows] = useState<JoinedMovieRow[]>([]);
  const [phase, setPhase] = useState('Starting test...');
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(1);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function runJoinTest() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setElapsedMs(null);
        setPhase(`Fetching TMDB search page ${selectedPage}...`);
        setProgressText('');
        setRows([]);

        const startedAt = Date.now();

        const searchPage = await fetchTestSearchPage(selectedPage);

        if (isCancelled) {
          return;
        }

        const movies = searchPage.movies;

        setPhase('Joining TMDB movie IDs to IMDb IDs and OMDb ratings...');
        setProgressText(`0 / ${movies.length}`);

        const joinedRows = await buildJoinedRows(movies, (completed, total) => {
          if (isCancelled) {
            return;
          }

          setProgressText(`${completed} / ${total}`);
        });

        if (isCancelled) {
          return;
        }

        setRows(joinedRows);
        setPhase('Join complete.');
        setElapsedMs(Date.now() - startedAt);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Unknown join test error'
        );
        setPhase('Join failed.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    runJoinTest();

    return () => {
      isCancelled = true;
    };
  }, [selectedPage]);

  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.title}>
        Movies To IMDb Join Test
      </Text>
      <Text allowFontScaling={false} style={styles.subtitle}>
        TMDB default search submit to TMDB external_ids to OMDb rating join
      </Text>
      <View style={styles.pagePickerRow}>
        <Text allowFontScaling={false} style={styles.pagePickerLabel}>
          Pages:
        </Text>
        {TEST_PAGES.map((pageNum) => {
          const isSelected = pageNum === selectedPage;

          return (
            <Pressable
              key={pageNum}
              onPress={() => setSelectedPage(pageNum)}
              style={[
                styles.pageButton,
                isSelected ? styles.pageButtonSelected : null,
              ]}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.pageButtonText,
                  isSelected ? styles.pageButtonTextSelected : null,
                ]}
              >
                {pageNum}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.statusRow}>
        <Text allowFontScaling={false} style={styles.phase}>
          {phase}
        </Text>
        {elapsedMs !== null ? (
          <Text allowFontScaling={false} style={styles.elapsed}>
            {`${(elapsedMs / 1000).toFixed(2)}s`}
          </Text>
        ) : null}
      </View>
      {progressText ? (
        <Text allowFontScaling={false} style={styles.progress}>
          {progressText}
        </Text>
      ) : null}
      {isLoading ? <ActivityIndicator size="small" style={styles.spinner} /> : null}
      {errorMessage ? (
        <Text allowFontScaling={false} style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.headerRow}>
        <Text allowFontScaling={false} style={[styles.headerCell, styles.titleColumn]}>
          Movie Title
        </Text>
        <Text allowFontScaling={false} style={[styles.headerCell, styles.ratingColumn]}>
          IMDb Rating
        </Text>
        <Text allowFontScaling={false} style={[styles.headerCell, styles.votesColumn]}>
          IMDb Votes
        </Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text allowFontScaling={false} style={[styles.cell, styles.titleColumn]}>
              {item.title}
            </Text>
            <Text allowFontScaling={false} style={[styles.cell, styles.ratingColumn]}>
              {item.imdbRating}
            </Text>
            <Text allowFontScaling={false} style={[styles.cell, styles.votesColumn]}>
              {item.imdbVotes}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    ...typography.pageTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.feedbackBody,
    color: colors.textSecondary,
    marginTop: 4,
  },
  pagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 8,
  },
  pagePickerLabel: {
    ...typography.feedbackBody,
    color: colors.textPrimary,
    marginRight: 8,
  },
  pageButton: {
    minWidth: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  pageButtonSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  pageButtonText: {
    ...typography.cardMeta,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  pageButtonTextSelected: {
    color: colors.actionOnPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phase: {
    ...typography.feedbackBody,
    color: colors.textPrimary,
    marginTop: 0,
    flex: 1,
  },
  elapsed: {
    ...typography.cardMeta,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  progress: {
    ...typography.cardMeta,
    color: colors.textSecondary,
    marginTop: 4,
  },
  spinner: {
    marginTop: 12,
  },
  error: {
    ...typography.feedbackBody,
    color: '#b42318',
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
    paddingBottom: 8,
    marginTop: 16,
  },
  headerCell: {
    ...typography.cardMeta,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingVertical: 10,
  },
  cell: {
    ...typography.feedbackBody,
    color: colors.textPrimary,
  },
  titleColumn: {
    flex: 1.5,
    paddingRight: 8,
  },
  ratingColumn: {
    flex: 0.7,
    paddingRight: 8,
  },
  votesColumn: {
    flex: 1,
  },
});
