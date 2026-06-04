/**
 * Type definitions for shared movie-image helpers.
 *
 * The image helper only needs the two TMDB image fields, not a full movie
 * object. This small type keeps that helper flexible: it can accept a complete
 * movie or any lightweight object that has the same poster/backdrop fields.
 */

import type { movieType } from './MovieTypes';

export type MovieImageFields = Pick<movieType, 'poster_path' | 'backdrop_path'>;
