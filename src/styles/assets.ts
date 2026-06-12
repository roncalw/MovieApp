/**
 * Shared image assets used across MovieApp.
 *
 * Imported by:
 * - Feature components that need app-owned bitmap assets.
 *
 * Code flow:
 * 1. Components import imageAssets instead of calling require directly.
 * 2. Asset filenames stay centralized here, making replacement safer.
 */
export const imageAssets = {
  cinemaMenu: require('../assets/images/cinema_menu.jpg'),
  missingMovie: require('../assets/images/MissingMoviePlaceholder.png'),
  missingPerson: require('../assets/images/MissingPersonPlaceholder.png'),
  imdbLogo: require('../assets/images/imdb.png'),
  tmdbLogo: require('../assets/images/TMDB_Logo.png'),
  justWatchLogo: require('../assets/images/JustWatch_Logo.png'),
} as const;
