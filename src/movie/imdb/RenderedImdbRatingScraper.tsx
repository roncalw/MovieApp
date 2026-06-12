/**
 * Hidden IMDb WebView scraper used by Movie Detail.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx renders this component when an IMDb refresh is
 *   requested from the IMDb badge.
 *
 * Code flow:
 * 1. useMovieImdbRating creates an ImdbScrapeRequest with an IMDb id.
 * 2. MovieDetail passes that request here.
 * 3. This component loads the IMDb ratings page in a hidden WebView, injects a
 *    small page-reading script, and reports one typed result back to the hook.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type {
  ImdbWebsiteRatingScrapeResult,
  ImdbWebsiteRatingScrapeStatus,
} from '../../types/tmdb/tmdbApiTypes';
import type { ImdbScrapeRequest } from '../../types/movie/movieDetailTypes';
import { renderedImdbRatingScraperStyles as styles } from '../../styles/movie/renderedImdbRatingScraperStyles';

const IMDB_RENDERED_PAGE_SCRAPE_TIMEOUT_MS = 15000;
const IMDB_RENDERED_PAGE_SCRAPE_SCRIPT = `
(function () {
  var hasPostedResult = false;
  var attempts = 0;
  var maxAttempts = 50;

  function postResult(status, imdbRating, imdbVotes) {
    if (hasPostedResult) {
      return;
    }

    hasPostedResult = true;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      status: status,
      imdbRating: imdbRating,
      imdbVotes: imdbVotes || ''
    }));
  }

  function readJsonLdRating() {
    var scripts = Array.prototype.slice.call(document.querySelectorAll('script[type="application/ld+json"]'));

    for (var index = 0; index < scripts.length; index += 1) {
      try {
        var jsonValue = JSON.parse(scripts[index].textContent || '{}');
        var aggregateRating = jsonValue && jsonValue.aggregateRating;
        var ratingValue = aggregateRating && aggregateRating.ratingValue;

        if (ratingValue) {
          return {
            imdbRating: Number.parseFloat(String(ratingValue)),
            imdbVotes: aggregateRating.ratingCount ? String(aggregateRating.ratingCount) : ''
          };
        }
      } catch (error) {
      }
    }

    return null;
  }

  function readVisibleRating() {
    var ratingElements = [
      document.querySelector('[data-testid="rating-button__aggregate-rating__score"]'),
      document.querySelector('[data-testid="hero-rating-bar__aggregate-rating__score"]')
    ].filter(Boolean);

    for (var index = 0; index < ratingElements.length; index += 1) {
      var ratingText = ratingElements[index].textContent || '';
      var ratingMatch = ratingText.match(/(\\d+(?:\\.\\d+)?)/);

      if (ratingMatch) {
        return {
          imdbRating: Number.parseFloat(ratingMatch[1]),
          imdbVotes: ''
        };
      }
    }

    return null;
  }

  function scrapeRenderedPage() {
    attempts += 1;

    var pageText = document.body ? document.body.innerText || '' : '';
    var challengeTextPattern = /(captcha|not a robot|robot check|verify you are human|unusual traffic|aws waf|challenge)/i;
    var noRatingTextPattern = /(we don't have any ratings for this title yet|we do not have any ratings for this title yet|no ratings for this title yet)/i;

    if (challengeTextPattern.test(pageText)) {
      postResult('imdb_challenge', null, '');
      return;
    }

    var jsonLdRating = readJsonLdRating();
    var visibleRating = jsonLdRating || readVisibleRating();

    if (visibleRating && !Number.isNaN(visibleRating.imdbRating)) {
      postResult('rating_found', visibleRating.imdbRating, visibleRating.imdbVotes);
      return;
    }

    if (noRatingTextPattern.test(pageText)) {
      postResult('rating_not_found', null, '');
      return;
    }

    if (attempts >= maxAttempts) {
      postResult('request_failed', null, '');
      return;
    }

    setTimeout(scrapeRenderedPage, 250);
  }

  scrapeRenderedPage();
})();
true;
`;

export function RenderedImdbRatingScraper({
  scrapeRequest,
  onResult,
}: {
  scrapeRequest: ImdbScrapeRequest | null;
  onResult: (result: ImdbWebsiteRatingScrapeResult) => void;
}) {
  const hasReportedResultRef = useRef(false);

  const reportResult = useCallback(
    (result: ImdbWebsiteRatingScrapeResult) => {
      if (hasReportedResultRef.current) {
        return;
      }

      hasReportedResultRef.current = true;
      onResult(result);
    },
    [onResult]
  );

  useEffect(() => {
    hasReportedResultRef.current = false;

    if (!scrapeRequest) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      reportResult({
        imdbRating: null,
        imdbVotes: '',
        status: 'request_failed',
      });
    }, IMDB_RENDERED_PAGE_SCRAPE_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [reportResult, scrapeRequest]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const parsedMessage = JSON.parse(event.nativeEvent.data) as Partial<
          ImdbWebsiteRatingScrapeResult
        >;
        const scrapeStatus = parsedMessage.status;

        if (!isImdbScrapeStatus(scrapeStatus)) {
          reportResult({
            imdbRating: null,
            imdbVotes: '',
            status: 'request_failed',
          });
          return;
        }

        reportResult({
          imdbRating:
            typeof parsedMessage.imdbRating === 'number'
              ? parsedMessage.imdbRating
              : null,
          imdbVotes:
            typeof parsedMessage.imdbVotes === 'string'
              ? parsedMessage.imdbVotes
              : '',
          status: scrapeStatus,
        });
      } catch {
        reportResult({
          imdbRating: null,
          imdbVotes: '',
          status: 'request_failed',
        });
      }
    },
    [reportResult]
  );

  const handleWebViewError = useCallback(() => {
    reportResult({
      imdbRating: null,
      imdbVotes: '',
      status: 'request_failed',
    });
  }, [reportResult]);

  if (!scrapeRequest) {
    return null;
  }

  return (
    <WebView
      key={scrapeRequest.requestKey}
      source={{
        uri: getImdbRatingsUrl(scrapeRequest.imdbId),
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }}
      injectedJavaScript={IMDB_RENDERED_PAGE_SCRAPE_SCRIPT}
      javaScriptEnabled
      domStorageEnabled
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      onMessage={handleMessage}
      onError={handleWebViewError}
      onHttpError={handleWebViewError}
      style={styles.hiddenImdbScrapeWebView}
      containerStyle={styles.hiddenImdbScrapeWebView}
      pointerEvents="none"
    />
  );
}

function isImdbScrapeStatus(
  value: unknown
): value is ImdbWebsiteRatingScrapeStatus {
  return (
    value === 'rating_found' ||
    value === 'imdb_challenge' ||
    value === 'rating_not_found' ||
    value === 'request_failed'
  );
}

function getImdbRatingsUrl(imdbId: string) {
  return `https://www.imdb.com/title/${imdbId}/ratings/`;
}
