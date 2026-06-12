/**
 * Styles for the hidden IMDb ratings WebView.
 *
 * Imported by:
 * - src/movie/imdb/RenderedImdbRatingScraper.tsx
 */
import { StyleSheet } from 'react-native';

export const renderedImdbRatingScraperStyles = StyleSheet.create({
  hiddenImdbScrapeWebView: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
