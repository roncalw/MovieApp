import AsyncStorage from '@react-native-async-storage/async-storage';
import type { movieType } from '../types/MovieTypes';

export const MOVIE_FAVORITES_STORAGE_KEY = 'movieFavoritesData';
export const MOVIE_SEEN_STORAGE_KEY = 'movieSeenData';

export type MovieUserListStorageKey =
  | typeof MOVIE_FAVORITES_STORAGE_KEY
  | typeof MOVIE_SEEN_STORAGE_KEY;

export type StoredMovieListItem = {
  id: number;
  adult: boolean;
  backdrop_path?: string;
  genres?: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

function parseStoredMovieList(value: string | null): StoredMovieListItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
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
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
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

export async function getStoredMovieList(
  storageKey: MovieUserListStorageKey
): Promise<StoredMovieListItem[]> {
  const value = await AsyncStorage.getItem(storageKey);

  return parseStoredMovieList(value);
}

export async function isMovieInStoredList(
  storageKey: MovieUserListStorageKey,
  movieId: number
): Promise<boolean> {
  const movies = await getStoredMovieList(storageKey);

  return movies.some(movie => movie.id === movieId);
}

export async function saveMovieToStoredList(
  storageKey: MovieUserListStorageKey,
  movie: StoredMovieListItem
): Promise<void> {
  const movies = await getStoredMovieList(storageKey);
  const nextMovies = movies.some(savedMovie => savedMovie.id === movie.id)
    ? movies.map(savedMovie => (savedMovie.id === movie.id ? movie : savedMovie))
    : [...movies, movie];

  await AsyncStorage.setItem(storageKey, JSON.stringify(nextMovies));
}

export async function removeMovieFromStoredList(
  storageKey: MovieUserListStorageKey,
  movieId: number
): Promise<void> {
  const movies = await getStoredMovieList(storageKey);
  const nextMovies = movies.filter(movie => movie.id !== movieId);

  await AsyncStorage.setItem(storageKey, JSON.stringify(nextMovies));
}

export async function clearStoredMovieList(
  storageKey: MovieUserListStorageKey
): Promise<void> {
  await AsyncStorage.removeItem(storageKey);
}

export async function getStoredMovieIds(
  storageKey: MovieUserListStorageKey
): Promise<Set<number>> {
  const movies = await getStoredMovieList(storageKey);

  return new Set(movies.map(movie => movie.id));
}
