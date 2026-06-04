/**
 * Type definitions for Search by Movie Title.
 *
 * Title search loads TMDB results first and then fills each card's IMDb rating
 * afterward. This map stores ratings by TMDB movie id so the screen can update
 * one card at a time without blocking the initial results from appearing.
 */

export type MovieRatingById = Record<number, number | null>;
