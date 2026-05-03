import type { ImageSourcePropType } from 'react-native';

export type LabelValueItem = {
  label: string;
  value: string;
};

export type RatingItem = {
  id: string;
  label: string;
};

export type StreamerItem = {
  label: string;
  value: string;
  image: ImageSourcePropType;
};

export type SortItem = {
  id: string;
  label: string;
  value: string;
};

export const GENRE_ITEMS: LabelValueItem[] = [
  { label: 'Action', value: '28' },
  { label: 'Adventure', value: '12' },
  { label: 'Animation', value: '16' },
  { label: 'Comedy', value: '35' },
  { label: 'Crime', value: '80' },
  { label: 'Documentary', value: '99' },
  { label: 'Drama', value: '18' },
  { label: 'Family', value: '10751' },
  { label: 'Fantasy', value: '14' },
  { label: 'History', value: '36' },
  { label: 'Horror', value: '27' },
  { label: 'Music', value: '10402' },
  { label: 'Mystery', value: '9648' },
  { label: 'Romance', value: '10749' },
  { label: 'SciFi', value: '878' },
  { label: 'Thriller', value: '53' },
  { label: 'War', value: '10752' },
  { label: 'Western', value: '37' },
];

export const RATING_ITEMS: RatingItem[] = [
  { id: 'G', label: 'G' },
  { id: 'PG', label: 'PG' },
  { id: 'PG-13', label: 'PG-13' },
  { id: 'R', label: 'R' },
];

export const STREAMER_ITEMS: StreamerItem[] = [
  { label: 'Netflix', value: '8', image: require('../../assets/images/netflix.png') },
  { label: 'Hulu', value: '15', image: require('../../assets/images/hulu.png') },
  { label: 'Prime', value: '9', image: require('../../assets/images/amazon_prime.png') },
  { label: 'Max', value: '1899', image: require('../../assets/images/max.png') },
  { label: 'YouTube', value: '192', image: require('../../assets/images/youtube_premium.png') },
  { label: 'Disney Plus', value: '337', image: require('../../assets/images/disney_plus.png') },
  { label: 'Apple TV Plus', value: '350', image: require('../../assets/images/apple_tv_plus.png') },
  { label: 'Peacock', value: '387', image: require('../../assets/images/peacock.png') },
  { label: 'AMC+', value: '526', image: require('../../assets/images/amc.png') },
  { label: 'Paramount+', value: '531', image: require('../../assets/images/paramount_plus.png') },
];

export const SORT_ITEMS: SortItem[] = [
  { id: '1', label: 'Popularity', value: '0' },
  { id: '2', label: 'User Rating (500+ Reviews)', value: '500' },
  { id: '3', label: 'User Rating (5,000+ Reviews)', value: '5000' },
  { id: '4', label: 'User Rating (15,000+ Reviews)', value: '15000' },
  { id: '5', label: 'User Rating (25,000+ Reviews)', value: '25000' },
];

export function formatSelectedLabels(selectedValues: string[], items: LabelValueItem[]) {
  if (selectedValues.length === 0) {
    return 'Any';
  }

  return items
    .filter((item) => selectedValues.includes(item.value))
    .map((item) => item.label)
    .join(', ');
}

export function formatInlineSummary(selectedValues: string[], items: LabelValueItem[]) {
  if (selectedValues.length === 0) {
    return '';
  }

  return items
    .filter((item) => selectedValues.includes(item.value))
    .map((item) => item.label)
    .sort()
    .join(' | ');
}

export function toggleArrayValue(currentValues: string[], nextValue: string) {
  if (currentValues.includes(nextValue)) {
    return currentValues.filter((value) => value !== nextValue);
  }

  return [...currentValues, nextValue];
}

export function getInitialSortValue(appliedSortBy: string, appliedVoteCount: string) {
  if (appliedSortBy === 'popularity.desc' && appliedVoteCount === '0') {
    return '0';
  }

  if (appliedSortBy === 'vote_average.desc') {
    return appliedVoteCount;
  }

  return '';
}

export function getSelectedSortLabel(selectedSortValue: string) {
  return SORT_ITEMS.find((item) => item.value === selectedSortValue)?.label ?? '';
}

export function getAppliedSortLabel(appliedSortBy: string, appliedVoteCount: string) {
  const selectedSortValue = getInitialSortValue(appliedSortBy, appliedVoteCount);
  return SORT_ITEMS.find((item) => item.value === selectedSortValue)?.label ?? 'Popular';
}
