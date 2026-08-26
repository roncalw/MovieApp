import AsyncStorage from '@react-native-async-storage/async-storage';
import type { movieType } from '../../types/movie/MovieTypes';
import type {
  MovieUserListStorageKey,
  StoredMovieListData,
  StoredMovieListItem,
} from '../../types/movie/movieUserListTypes';

export const MOVIE_FAVORITES_STORAGE_KEY = 'movieFavoritesData';
export const MOVIE_SEEN_STORAGE_KEY = 'movieSeenData';

const EMPTY_STORED_MOVIE_LIST_DATA: StoredMovieListData = {
  movies: [],
  cardDataRefreshedLocalDate: null,
};

function isStoredMovieListItemArray(
  value: unknown,
): value is StoredMovieListItem[] {
  return Array.isArray(value);
}

export function parseStoredMovieListData(
  value: string | null,
): StoredMovieListData {
  if (!value) {
    return EMPTY_STORED_MOVIE_LIST_DATA;
  }

  try {
    const parsedValue = JSON.parse(value);

    // Versions before this change stored the movie array directly. Returning a
    // null refresh date safely upgrades that record on its next screen visit.
    if (isStoredMovieListItemArray(parsedValue)) {
      return {
        movies: parsedValue,
        cardDataRefreshedLocalDate: null,
      };
    }

    if (
      typeof parsedValue === 'object' &&
      parsedValue !== null &&
      isStoredMovieListItemArray(parsedValue.movies)
    ) {
      return {
        movies: parsedValue.movies,
        cardDataRefreshedLocalDate:
          typeof parsedValue.cardDataRefreshedLocalDate === 'string'
            ? parsedValue.cardDataRefreshedLocalDate
            : null,
      };
    }

    return EMPTY_STORED_MOVIE_LIST_DATA;
  } catch {
    return EMPTY_STORED_MOVIE_LIST_DATA;
  }
}

export function toStoredMovieListItem(movie: movieType): StoredMovieListItem {
  return {
    id: movie.id,
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    genres: movie.genres?.map(genre => genre.id) ?? movie.genreIds ?? [],
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: movie.title,
    video: movie.video,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    imdb_rating: movie.imdb_rating,
    available_with_subscription: movie.available_with_subscription,
    available_without_rent_or_purchase:
      movie.available_without_rent_or_purchase,
  };
}

export function storedMovieToMovieType(movie: StoredMovieListItem): movieType {
  return {
    id: movie.id,
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    genres: [],
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: movie.title,
    video: movie.video,
    vote_average: movie.imdb_rating ?? movie.vote_average,
    vote_count: movie.vote_count,
    imdb_rating: movie.imdb_rating,
    available_with_subscription: movie.available_with_subscription,
    available_without_rent_or_purchase:
      movie.available_without_rent_or_purchase,
    genreIds: movie.genres ?? [],
    budget: 0,
    revenue: 0,
    runtime: 0,
    credits: { cast: [], crew: [] },
    release_dates: { results: [] },
    videos: { results: [] },
    production_companies: [],
    production_countries: [],
  };
}

export function storedMovieHasCompleteCardData(movie: StoredMovieListItem) {
  return (
    (typeof movie.imdb_rating === 'number' || movie.imdb_rating === null) &&
    typeof movie.available_with_subscription === 'boolean' &&
    typeof movie.available_without_rent_or_purchase === 'boolean'
  );
}

export async function getStoredMovieListData(
  storageKey: MovieUserListStorageKey,
): Promise<StoredMovieListData> {
  const value = await AsyncStorage.getItem(storageKey);

  return parseStoredMovieListData(value);
}

export async function getStoredMovieList(
  storageKey: MovieUserListStorageKey,
): Promise<StoredMovieListItem[]> {
  const data = await getStoredMovieListData(storageKey);

  return data.movies;
}

export async function getStoredMovieListCount(
  storageKey: MovieUserListStorageKey,
): Promise<number> {
  const movies = await getStoredMovieList(storageKey);

  return movies.length;
}

export async function isMovieInStoredList(
  storageKey: MovieUserListStorageKey,
  movieId: number,
): Promise<boolean> {
  const movies = await getStoredMovieList(storageKey);

  return movies.some(movie => movie.id === movieId);
}

export async function saveMovieToStoredList(
  storageKey: MovieUserListStorageKey,
  movie: StoredMovieListItem,
): Promise<void> {
  const data = await getStoredMovieListData(storageKey);
  const nextMovies = data.movies.some(savedMovie => savedMovie.id === movie.id)
    ? data.movies.map(savedMovie =>
        savedMovie.id === movie.id ? movie : savedMovie,
      )
    : [...data.movies, movie];

  await AsyncStorage.setItem(
    storageKey,
    JSON.stringify({ ...data, movies: nextMovies }),
  );
}

export async function removeMovieFromStoredList(
  storageKey: MovieUserListStorageKey,
  movieId: number,
): Promise<void> {
  const data = await getStoredMovieListData(storageKey);
  const nextMovies = data.movies.filter(movie => movie.id !== movieId);

  await AsyncStorage.setItem(
    storageKey,
    JSON.stringify({ ...data, movies: nextMovies }),
  );
}

export async function saveRefreshedStoredMovieList(
  storageKey: MovieUserListStorageKey,
  movies: movieType[],
  cardDataRefreshedLocalDate: string,
): Promise<boolean> {
  const currentData = await getStoredMovieListData(storageKey);
  const currentMovieIds = currentData.movies.map(movie => movie.id);
  const refreshedMovieIds = movies.map(movie => movie.id);

  if (
    currentMovieIds.length !== refreshedMovieIds.length ||
    currentMovieIds.some(movieId => !refreshedMovieIds.includes(movieId))
  ) {
    // A Favorite/Seen action changed the list while its card-data request was
    // running. Never overwrite that newer add/remove action with stale IDs.
    return false;
  }

  await AsyncStorage.setItem(
    storageKey,
    JSON.stringify({
      movies: movies.map(toStoredMovieListItem),
      cardDataRefreshedLocalDate,
    } satisfies StoredMovieListData),
  );

  return true;
}

export async function clearStoredMovieList(
  storageKey: MovieUserListStorageKey,
): Promise<void> {
  await AsyncStorage.removeItem(storageKey);
}

export async function getStoredMovieIds(
  storageKey: MovieUserListStorageKey,
): Promise<Set<number>> {
  const movies = await getStoredMovieList(storageKey);

  return new Set(movies.map(movie => movie.id));
}
