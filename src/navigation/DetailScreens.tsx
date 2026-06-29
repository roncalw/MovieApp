/**
 * Route adapters for the root native-stack detail screens.
 *
 * MovieDetail and PersonDetail remain reusable presentation components. These
 * adapters translate native-stack route parameters and navigation actions into
 * their callback props, including movie -> person -> movie navigation chains.
 */
import React, { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { MovieDetail } from '../movie/MovieDetail';
import { PersonDetail } from '../person/PersonDetail';
import type { movieType } from '../types/movie/MovieTypes';
import type { AppRootStackParamList } from '../types/navigation/navigationTypes';
import {
  getMovieDetailsQueryOptions,
  getPersonDetailsQueryOptions,
} from '../hooks/useMovieSearchQuery';

type MovieDetailScreenProps = NativeStackScreenProps<
  AppRootStackParamList,
  'MovieDetail'
>;

type PersonDetailScreenProps = NativeStackScreenProps<
  AppRootStackParamList,
  'PersonDetail'
>;

export function MovieDetailScreen({
  navigation,
  route,
}: MovieDetailScreenProps) {
  const queryClient = useQueryClient();
  const handlePersonPress = useCallback(
    (personId: number, initialPersonName?: string) => {
      void queryClient.prefetchQuery(getPersonDetailsQueryOptions(personId));
      navigation.push('PersonDetail', { personId, initialPersonName });
    },
    [navigation, queryClient],
  );

  return (
    <MovieDetail
      movieId={route.params.movieId}
      initialMovie={route.params.initialMovie}
      onBackPress={navigation.goBack}
      onPersonPress={handlePersonPress}
    />
  );
}

export function PersonDetailScreen({
  navigation,
  route,
}: PersonDetailScreenProps) {
  const queryClient = useQueryClient();
  const handleMoviePress = useCallback(
    (movie: movieType) => {
      void queryClient.prefetchQuery(getMovieDetailsQueryOptions(movie.id));
      navigation.push('MovieDetail', {
        movieId: movie.id,
        initialMovie: movie,
      });
    },
    [navigation, queryClient],
  );

  return (
    <PersonDetail
      personId={route.params.personId}
      initialPersonName={route.params.initialPersonName}
      onBackPress={navigation.goBack}
      onCloseAllPress={navigation.popToTop}
      onMoviePress={handleMoviePress}
    />
  );
}
