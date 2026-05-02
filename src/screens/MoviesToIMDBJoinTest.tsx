import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getDefaultBeginDate,
  getDefaultEndDate,
} from '../utils/movieSearchDates';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const CLOUDFLARE_MOVIE_SEARCH_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/movies/search';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w92';
const PAGE_SIZE = 20;

type CloudflareMovieSearchItem = {
  tmdb_id: number;
  poster_path: string;
  imdb_rating: number | null;
};

type CloudflareMovieSearchResponse = {
  movies: CloudflareMovieSearchItem[];
  nextCursor: string | null;
  pageSize: number;
  sort: string;
  beginDate: string;
  endDate: string;
};

async function fetchCloudflareMovieSearchPage(cursor: string | null) {
  const queryParts = [
    `pageSize=${PAGE_SIZE}`,
    `beginDate=${getDefaultBeginDate()}`,
    'endDatePreset=today',
  ];

  if (cursor) {
    queryParts.push(`cursor=${encodeURIComponent(cursor)}`);
  }

  const response = await fetch(
    `${CLOUDFLARE_MOVIE_SEARCH_URL}?${queryParts.join('&')}`
  );

  if (!response.ok) {
    throw new Error(`Cloudflare movie search failed: ${response.status}`);
  }

  return response.json() as Promise<CloudflareMovieSearchResponse>;
}

export function MoviesToIMDBJoinTest() {
  const [rows, setRows] = useState<CloudflareMovieSearchItem[]>([]);
  const [phase, setPhase] = useState('Starting test...');
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadedPages, setLoadedPages] = useState(0);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadFirstPage() {
      try {
        setIsLoading(true);
        setIsLoadingMore(false);
        setErrorMessage(null);
        setElapsedMs(null);
        setPhase('Fetching Cloudflare search page 1...');
        setProgressText('');
        setRows([]);
        setNextCursor(null);
        nextCursorRef.current = null;
        setLoadedPages(0);

        const startedAt = Date.now();
        const searchPage = await fetchCloudflareMovieSearchPage(null);

        if (isCancelled) {
          return;
        }

        nextCursorRef.current = searchPage.nextCursor;
        setNextCursor(searchPage.nextCursor);
        setLoadedPages(1);
        setRows(searchPage.movies);
        setPhase('Cloudflare search ready.');
        setProgressText(`${searchPage.movies.length} movies, sort ${searchPage.sort}`);
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

    loadFirstPage();

    return () => {
      isCancelled = true;
    };
  }, []);

  const loadNextPage = useCallback(async () => {
    if (isLoadingMoreRef.current || !nextCursorRef.current) {
      return;
    }

    const cursor = nextCursorRef.current;
    const pageToLoad = loadedPages + 1;

    try {
      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);
      setErrorMessage(null);
      setPhase(`Fetching Cloudflare search page ${pageToLoad}...`);

      const startedAt = Date.now();
      const searchPage = await fetchCloudflareMovieSearchPage(cursor);

      nextCursorRef.current = searchPage.nextCursor;
      setNextCursor(searchPage.nextCursor);
      setLoadedPages(pageToLoad);
      setRows((currentRows) => [...currentRows, ...searchPage.movies]);
      setPhase('Cloudflare search ready.');
      setProgressText(
        `${rows.length + searchPage.movies.length} movies loaded across ${pageToLoad} pages`
      );
      setElapsedMs(Date.now() - startedAt);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unknown search paging error'
      );
      setPhase('Next page failed.');
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [loadedPages, rows.length]);

  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.title}>
        Cloudflare Movie Search Test
      </Text>
      <Text allowFontScaling={false} style={styles.subtitle}>
        Cloudflare movie search endpoint using automatic cursor paging
      </Text>
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
          Poster
        </Text>
        <Text allowFontScaling={false} style={[styles.headerCell, styles.ratingColumn]}>
          TMDB ID
        </Text>
        <Text allowFontScaling={false} style={[styles.headerCell, styles.ratingColumn]}>
          IMDb Rating
        </Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.tmdb_id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.45}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" style={styles.footerSpinner} />
          ) : !nextCursor && rows.length > 0 ? (
            <Text allowFontScaling={false} style={styles.endText}>
              End of results
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.cell, styles.titleColumn]}>
              <Image
                source={{ uri: `${POSTER_BASE_URL}${item.poster_path}` }}
                style={styles.poster}
                resizeMode="cover"
              />
            </View>
            <Text allowFontScaling={false} style={[styles.cell, styles.ratingColumn]}>
              {item.tmdb_id}
            </Text>
            <Text allowFontScaling={false} style={[styles.cell, styles.ratingColumn]}>
              {item.imdb_rating ?? 'N/A'}
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
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
  footerSpinner: {
    paddingVertical: 16,
  },
  endText: {
    ...typography.cardMeta,
    color: colors.textSecondary,
    paddingVertical: 16,
    textAlign: 'center',
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
    alignItems: 'center',
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
  poster: {
    width: 46,
    height: 69,
    borderRadius: 4,
    backgroundColor: '#ececec',
  },
});
