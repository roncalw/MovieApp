import { shouldResetSearchForDrawerNavigation } from '../src/search/shared/SearchPageResetCoordinator';

describe('shouldResetSearchForDrawerNavigation', () => {
  it.each([
    ['AdvancedSearch', 'Home'],
    ['AdvancedSearch', 'MovieFavorites'],
    ['SearchByMovieTitle', 'Home'],
    ['SearchByMovieTitle', 'PrivacyPolicy'],
  ])('resets %s when the drawer selects %s', (current, selected) => {
    expect(shouldResetSearchForDrawerNavigation(current, selected)).toBe(true);
  });

  it.each([
    ['AdvancedSearch', 'AdvancedSearch'],
    ['SearchByMovieTitle', 'SearchByMovieTitle'],
    ['Home', 'AdvancedSearch'],
    ['Settings', 'Home'],
    [undefined, 'Home'],
  ])('does not reset when moving from %s to %s', (current, selected) => {
    expect(shouldResetSearchForDrawerNavigation(current, selected)).toBe(false);
  });
});
