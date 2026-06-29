/**
 * MovieApp's automatic query retry policy.
 *
 * TanStack Query otherwise retries every failure three times with progressively
 * longer delays. MovieApp instead gives temporary transport/server failures one
 * quick second attempt. Permanent client errors fail immediately and remain
 * available to the existing manual Retry buttons.
 */
import axios from 'axios';

const TRANSIENT_HTTP_STATUSES = new Set([408, 500, 502, 503, 504]);

export const QUERY_RETRY_DELAY_MS = 500;

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= 1) {
    return false;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return TRANSIENT_HTTP_STATUSES.has(error.response.status);
}

export function getQueryRetryDelay() {
  return QUERY_RETRY_DELAY_MS;
}
