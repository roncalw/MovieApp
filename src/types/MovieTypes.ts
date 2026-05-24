/*
Step: 13
   * /MovieApp/src/types/MovieTypes.ts
Imported by:
   * /MovieApp/src/api/tmdb/services/movieService.ts
   * /MovieApp/src/api/tmdb/responseTypes.ts
   * /MovieApp/src/api/tmdb/mappers/movieMapper.ts
   * /MovieApp/src/screens/MovieSearchScreen.tsx
   * /MovieApp/src/screens/MovieDetail.tsx
   * /MovieApp/src/screens/PopularMoviesScreen.tsx
Next step path:
   * /MovieApp/src/api/tmdb/responseTypes.ts
Purpose:
   * Centralizes the app's shared movie-related TypeScript types so screens, hooks, services, and mappers all agree on the 
     same data model.
*/
/*
  This file centralizes the movie-related types used across the app.

  IN THIS PROJECT:
  - screens, services, hooks, and mappers can import from one place
  - this now replaces the older split between movie.ts and genre.ts
*/

export type movieGenres = {
  id: number;
  name: string;
};

export type movieCrewProfile = {
  id: number;
  adult: number;
  gender: number;
  known_for_department: string;
  name: string;
  original_name: string;
  profile_path: string;
  job: string;
};

export type movieCastProfile = {
  id: number;
  adult: number;
  gender: number;
  known_for_department: string;
  name: string;
  original_name: string;
  profile_path: string;
  character: string;
};

export type credits = {
  cast: movieCastProfile[];
  crew: movieCrewProfile[];
};

export type production_company = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

export type production_country = {
  iso_3166_1: string;
  name: string;
};

export type release_details = {
  certification: string;
  note: string;
  type: number;
};

export type release_date_country = {
  iso_3166_1: string;
  release_dates: release_details[];
};

export type release_date_results = {
  results: release_date_country[];
};

export type movieWatchProviderType = {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
};

export type streamTypes = {
  ads?: movieWatchProviderType[];
  flatrate?: movieWatchProviderType[];
  rent?: movieWatchProviderType[];
};

export type movieWatchProvidersType = {
  results: {
    US?: streamTypes;
    [countryCode: string]: streamTypes | undefined;
  };
};

export type movieTrailerVideo = {
  id: string;
  /*
    TMDB calls this field "key".
    For YouTube videos, this is the video id that the player needs.
    Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ uses key dQw4w9WgXcQ.
  */
  key: string;
  /*
    TMDB calls the hosting platform "site".
    The trailer player in this app supports YouTube, so MovieDetail filters for
    site === "YouTube" before it shows the play button.
  */
  site: string;
  /*
    TMDB calls the video category "type".
    Common values include Trailer, Teaser, Clip, and Featurette.
    MovieDetail prefers type === "Trailer" so the main play button does not open
    a teaser or behind-the-scenes clip when a real trailer is available.
  */
  type: string;
  /*
    TMDB marks studio/channel uploads with official === true.
    MovieDetail prefers official trailers, then falls back to the first usable
    YouTube trailer if no official trailer exists.
  */
  official: boolean;
  /*
    Human-readable title from TMDB, such as "Official Trailer".
    This is useful for accessibility labels and future trailer lists.
  */
  name: string;
};

export type movieVideos = {
  results: movieTrailerVideo[];
};

export type movieExternalIDs = {
  id: number;
  imdb_id: string;
  wikidata_id: string;
  facebook_id: string;
  instagram_id: string;
  twitter_id: string;
};

export type movieRatingType = {
  Source: string;
  Value: string;
};

export type movieIMDBDataType = {
  Title: string;
  Awards: string;
  Poster: string;
  Ratings: movieRatingType[];
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
};

export type movieIMDBRatingType = {
  imdbRating: string | undefined;
  imdbVotes: string | undefined;
};

export type movieType = {
  id: number;
  adult: boolean;
  backdrop_path?: string;
  genres: movieGenres[];
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
  genreIds: number[];
  budget: number;
  revenue: number;
  runtime: number;
  credits: credits;
  release_dates: release_date_results;
  'watch/providers'?: movieWatchProvidersType;
  videos?: movieVideos;
  external_ids?: movieExternalIDs;
  production_companies: production_company[];
  production_countries: production_country[];
};

export type movieImage = [string, movieType];

export type movieImagesArray = movieImage[];

export type movieSearchResults = {
  page: number;
  movies: movieType[];
  totalPages: number;
};
