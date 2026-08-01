export const DEFAULT_MOVIE_ORIGINAL_LANGUAGES = ['en'] as const;

export function normalizeMovieOriginalLanguages(languageCodes: string[]) {
  return [
    ...new Set(
      languageCodes
        .map(languageCode => languageCode.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].sort();
}
