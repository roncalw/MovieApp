import type { MovieImageSize } from '../utils/movieImages';

/**
 * Home uses two TMDb image sizes because its two image layouts have very
 * different display widths.
 *
 * The hero keeps the existing 500-pixel source. Poster cards are only about
 * 120 display points wide, so TMDb's 342-pixel poster is already large enough
 * for the highest-density phones supported by this layout. This removes
 * unnecessary network bytes without changing which movies are prepared or
 * when a Home section is allowed to appear.
 */
export const HOME_HERO_IMAGE_SIZE: MovieImageSize = 'w500';
export const HOME_POSTER_ROW_IMAGE_SIZE: MovieImageSize = 'w342';
