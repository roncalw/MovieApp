import type {
  HomeAdvancedSearchSectionConfig,
  HomeAdvancedSearchSectionId,
} from '../types/home/homeTypes';

export const HOME_ADVANCED_SEARCH_SECTIONS: HomeAdvancedSearchSectionConfig[] = [
  {
    id: 'popular',
    title: 'Popular Movies',
    advancedSearchParams: {
      movieRatings: '',
      movieGenres: [],
      movieStreamers: [],
      movieVoteCount: '',
      movieSortBy: 'popularity.desc',
    },
  },
  {
    id: 'family',
    title: 'Family Movies',
    advancedSearchParams: {
      movieRatings: '',
      movieGenres: ['10751'],
      movieSortBy: 'popularity.desc',
    },
  },
  {
    id: 'comedy',
    title: 'Comedy Movies',
    advancedSearchParams: {
      movieGenres: ['35'],
      movieSortBy: 'popularity.desc',
    },
  },
  {
    id: 'drama',
    title: 'Drama Movies',
    advancedSearchParams: {
      movieGenres: ['18'],
      movieSortBy: 'popularity.desc',
    },
  },
  {
    id: 'crime',
    title: 'Crime Movies',
    advancedSearchParams: {
      movieGenres: ['80'],
      movieSortBy: 'popularity.desc',
    },
  },
  {
    id: 'horror',
    title: 'Horror Movies',
    advancedSearchParams: {
      movieGenres: ['27'],
      movieSortBy: 'popularity.desc',
    },
  },
  {
    id: 'music',
    title: 'Music Movies',
    advancedSearchParams: {
      movieGenres: ['10402'],
      movieSortBy: 'popularity.desc',
    },
  },
  {
    id: 'documentary',
    title: 'Documentary Movies',
    advancedSearchParams: {
      movieGenres: ['99'],
      movieSortBy: 'popularity.desc',
    },
  },
];

export function getHomeAdvancedSearchSection(
  sectionId: HomeAdvancedSearchSectionId,
) {
  return (
    HOME_ADVANCED_SEARCH_SECTIONS.find(section => section.id === sectionId) ??
    null
  );
}
