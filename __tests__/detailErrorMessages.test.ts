import { getDetailErrorMessage } from '../src/shared/DetailResourceState';

function axiosError(status?: number, code?: string) {
  return {
    code,
    isAxiosError: true,
    response: status === undefined ? undefined : { status },
  };
}

describe('detail-page customer error messages', () => {
  test('hides technical 5xx details behind a temporary-service message', () => {
    expect(
      getDetailErrorMessage(
        axiosError(502),
        'Movie details could not be loaded.',
      ),
    ).toBe('The movie information service is temporarily unavailable.');
  });

  test('explains timeout and offline failures without showing Axios text', () => {
    expect(
      getDetailErrorMessage(
        axiosError(undefined, 'ECONNABORTED'),
        'Movie details could not be loaded.',
      ),
    ).toBe('The movie information service took too long to respond.');

    expect(
      getDetailErrorMessage(axiosError(), 'Movie details could not be loaded.'),
    ).toBe('Check your internet connection and try again.');
  });
});
