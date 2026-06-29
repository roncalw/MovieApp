import { AxiosError, AxiosHeaders } from 'axios';
import {
  getQueryRetryDelay,
  QUERY_RETRY_DELAY_MS,
  shouldRetryQuery,
} from '../src/api/queryRetryPolicy';

function createAxiosError(status?: number, code?: string) {
  return new AxiosError(
    'Request failed',
    code,
    undefined,
    undefined,
    status === undefined
      ? undefined
      : {
          config: { headers: new AxiosHeaders() },
          data: null,
          headers: {},
          status,
          statusText: 'Error',
        },
  );
}

describe('MovieApp query retry policy', () => {
  test.each([408, 500, 502, 503, 504])('retries HTTP %i once', status => {
    const error = createAxiosError(status);

    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });

  test.each([400, 401, 403, 404, 429])('does not retry HTTP %i', status => {
    expect(shouldRetryQuery(0, createAxiosError(status))).toBe(false);
  });

  test('retries a timeout or missing response once', () => {
    expect(shouldRetryQuery(0, createAxiosError(undefined, 'ETIMEDOUT'))).toBe(
      true,
    );
    expect(shouldRetryQuery(0, createAxiosError())).toBe(true);
  });

  test('does not retry unrelated JavaScript errors', () => {
    expect(shouldRetryQuery(0, new Error('Bad mapper'))).toBe(false);
  });

  test('waits 500 milliseconds before the retry', () => {
    expect(getQueryRetryDelay()).toBe(QUERY_RETRY_DELAY_MS);
    expect(QUERY_RETRY_DELAY_MS).toBe(500);
  });
});
