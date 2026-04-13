/*
Step: 5
   * /MovieApp/src/utils/movieSearchDates.ts
Imported by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
Next step path:
   * /MovieApp/src/components/ui/YearWheelField.tsx
Purpose:
   * Centralizes the movie-search year/date rules so the screen, header, and year-wheel UI all derive the same real query dates.
*/

// Keep the wheel constrained to reasonable modern movie years without allowing
// future dates that the search API cannot meaningfully use.
export const MIN_SEARCH_YEAR = 1960;

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultBeginYear() {
  return getCurrentYear() - 5;
}

export function getDefaultEndYear() {
  return getCurrentYear();
}

export function getBeginDateFromYear(year: number) {
  return `${year}-01-01`;
}

export function getEndDateFromYear(year: number) {
  return year >= getCurrentYear() ? getTodayDateString() : `${year}-12-31`;
}

export function getDefaultBeginDate() {
  return getBeginDateFromYear(getDefaultBeginYear());
}

export function getDefaultEndDate() {
  return getTodayDateString();
}

export function getYearFromDateString(dateString: string, fallbackYear: number) {
  const parsedYear = Number(dateString.slice(0, 4));

  return Number.isFinite(parsedYear) ? parsedYear : fallbackYear;
}

export function buildSearchYearOptions(minYear = MIN_SEARCH_YEAR) {
  const currentYear = getCurrentYear();
  const itemCount = currentYear - minYear + 1;

  return Array.from({ length: itemCount }, (_, index) => currentYear - index);
}
