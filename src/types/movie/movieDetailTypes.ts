/**
 * Type definitions for the Movie Detail experience.
 *
 * These types describe the data and callback contracts used by the Movie Detail
 * page, including cast and crew cards, grouped credits, trailer playback, IMDb
 * refresh behavior, and the detail-page sections. Keeping these definitions in
 * one file makes it easier to understand what the detail page needs from parent
 * screens and what shape the detail-page helper components expect.
 */

import type {
  movieCastProfile,
  movieCrewProfile,
  movieType,
} from './MovieTypes';

export type MovieDetailProps = {
  movieId: number;
  initialMovie?: movieType | null;
  onBackPress?: () => void;
  onPersonPress?: (personId: number, initialPersonName?: string) => void;
};

export type CreditPerson = movieCastProfile | movieCrewProfile;

export type GroupedCreditPerson = {
  id: number;
  name: string;
  profile_path: string | null | undefined;
  roleLabels: string[];
};

export type CreditRailProps = {
  title: string;
  people: CreditPerson[];
  onPersonPress?: (personId: number, initialPersonName?: string) => void;
};

export type DetailInfoRowProps = {
  label: string;
  value: string;
};

export type TrailerModalProps = {
  trailerKey: string | null;
  onClose: () => void;
};

export type ImdbScrapeRequest = {
  imdbId: string;
  requestKey: number;
};
