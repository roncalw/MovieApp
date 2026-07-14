/**
 * Type definitions for the Person Detail page.
 *
 * These types describe the actor/crew popup page and the filmography data shown
 * there. A filmography group combines multiple roles for the same movie so a
 * person who directed, produced, and wrote one title appears once with the roles
 * listed together.
 */

import type { movieType } from './MovieTypes';

export type PersonDetailProps = {
  personId: number;
  initialPersonName?: string;
  onBackPress: () => void;
  onCloseAllPress: () => void;
  onMoviePress: (movie: movieType) => void;
};

export type PersonFamilyDate = {
  value: string;
  precision: 'year' | 'month' | 'day';
};

export type PersonFamilySpouse = {
  wikidataId: string;
  name: string;
  status: 'current' | 'former';
  startDate: PersonFamilyDate | null;
  endDate: PersonFamilyDate | null;
};

export type PersonFamilyChild = {
  wikidataId: string;
  name: string | null;
};

/**
 * Normalized family data returned by MovieApp's stateless Cloudflare endpoint.
 * The endpoint reads Wikidata and caches the response, but never stores these
 * relationships in the MovieApp database.
 */
export type PersonFamilyResponse = {
  wikidataId: string;
  spouses: PersonFamilySpouse[];
  children: PersonFamilyChild[];
  numberOfChildren: number | null;
  sourceUrl: string;
  fetchedAt: string;
  cacheMaxAgeSeconds: number;
};

export type PersonFamilyDisplayRow = {
  label: string;
  value: string;
};

export type FilmographyItem = {
  key: string;
  movie: movieType;
  title: string;
  year: string;
  roleLabel: string;
  releaseDate: string;
  popularity: number;
};

export type FilmographyGroup = Omit<FilmographyItem, 'roleLabel'> & {
  roles: string[];
};
