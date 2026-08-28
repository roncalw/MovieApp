import { Image } from 'react-native';
import {
  getFailedMovieImageUris,
  getUniqueMovieImageUris,
  prepareMovieImageUris,
} from '../src/utils/movieImageLoading';

describe('movie image preparation', () => {
  const originalQueryCache = Image.queryCache;
  const originalPrefetch = Image.prefetch;

  afterEach(() => {
    Image.queryCache = originalQueryCache;
    Image.prefetch = originalPrefetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('collects each TMDB image URL once across Home collections', () => {
    expect(
      getUniqueMovieImageUris([
        [
          { poster_path: '/one.jpg', backdrop_path: '' },
          { poster_path: '/two.jpg', backdrop_path: '' },
        ],
        [
          { poster_path: '/one.jpg', backdrop_path: '' },
          { poster_path: '', backdrop_path: '/three.jpg' },
        ],
      ]),
    ).toEqual([
      'https://image.tmdb.org/t/p/w500/one.jpg',
      'https://image.tmdb.org/t/p/w500/two.jpg',
      'https://image.tmdb.org/t/p/w500/three.jpg',
    ]);
  });

  test('prefetches only uncached URLs and reports failures without blocking', async () => {
    Image.queryCache = jest.fn(async () => ({
      'https://image.tmdb.org/t/p/w500/cached.jpg': 'disk' as const,
    }));
    Image.prefetch = jest.fn(async uri => !uri.endsWith('/failed.jpg'));
    jest.spyOn(console, 'info').mockImplementation(() => undefined);

    const result = await prepareMovieImageUris([
      'https://image.tmdb.org/t/p/w500/cached.jpg',
      'https://image.tmdb.org/t/p/w500/loaded.jpg',
      'https://image.tmdb.org/t/p/w500/failed.jpg',
      'https://image.tmdb.org/t/p/w500/loaded.jpg',
    ]);

    expect(Image.prefetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      requestedCount: 3,
      prefetchCount: 2,
      failedUris: ['https://image.tmdb.org/t/p/w500/failed.jpg'],
      timedOut: false,
    });
    expect(getFailedMovieImageUris()).toContain(
      'https://image.tmdb.org/t/p/w500/failed.jpg',
    );
  });

  test('combines concurrent cache checks and downloads a shared URL only once', async () => {
    const sharedUri = 'https://image.tmdb.org/t/p/w500/shared.jpg';
    const popularOnlyUri =
      'https://image.tmdb.org/t/p/w500/popular-only.jpg';
    const horrorOnlyUri =
      'https://image.tmdb.org/t/p/w500/horror-only.jpg';
    Image.queryCache = jest.fn(async () => ({}));
    Image.prefetch = jest.fn(async () => true);

    const [popularPreparation, horrorPreparation] = await Promise.all([
      prepareMovieImageUris([sharedUri, popularOnlyUri]),
      prepareMovieImageUris([sharedUri, horrorOnlyUri]),
    ]);

    expect(Image.queryCache).toHaveBeenCalledTimes(1);
    expect(Image.queryCache).toHaveBeenCalledWith([
      sharedUri,
      popularOnlyUri,
      horrorOnlyUri,
    ]);
    expect(Image.prefetch).toHaveBeenCalledTimes(3);
    expect(jest.mocked(Image.prefetch).mock.calls).toEqual([
      [sharedUri],
      [popularOnlyUri],
      [horrorOnlyUri],
    ]);
    expect(popularPreparation).toEqual({
      requestedCount: 2,
      prefetchCount: 2,
      failedUris: [],
      timedOut: false,
    });
    expect(horrorPreparation).toEqual({
      requestedCount: 2,
      prefetchCount: 2,
      failedUris: [],
      timedOut: false,
    });
  });

  test('shares one failed download while reporting it to every category', async () => {
    const sharedUri = 'https://image.tmdb.org/t/p/w500/shared-failure.jpg';
    Image.queryCache = jest.fn(async () => ({}));
    Image.prefetch = jest.fn(async () => false);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);

    const [firstPreparation, secondPreparation] = await Promise.all([
      prepareMovieImageUris([sharedUri]),
      prepareMovieImageUris([sharedUri]),
    ]);

    expect(Image.queryCache).toHaveBeenCalledTimes(1);
    expect(Image.prefetch).toHaveBeenCalledTimes(1);
    expect(firstPreparation.failedUris).toEqual([sharedUri]);
    expect(secondPreparation.failedUris).toEqual([sharedUri]);
  });

  test('returns after the safety timeout when native prefetch never settles', async () => {
    jest.useFakeTimers();
    Image.queryCache = jest.fn(async () => ({}));
    Image.prefetch = jest.fn(() => new Promise<boolean>(() => undefined));
    jest.spyOn(console, 'info').mockImplementation(() => undefined);

    const preparation = prepareMovieImageUris(
      ['https://image.tmdb.org/t/p/w500/hanging.jpg'],
      250,
    );

    await Promise.resolve();
    jest.advanceTimersByTime(250);

    await expect(preparation).resolves.toEqual({
      requestedCount: 1,
      prefetchCount: 1,
      failedUris: ['https://image.tmdb.org/t/p/w500/hanging.jpg'],
      timedOut: true,
    });

    // The timed-out native promise cannot be cancelled, but it must not remain
    // registered forever and prevent a later explicit retry of the same URL.
    Image.prefetch = jest.fn(async () => true);

    await expect(
      prepareMovieImageUris([
        'https://image.tmdb.org/t/p/w500/hanging.jpg',
      ]),
    ).resolves.toEqual({
      requestedCount: 1,
      prefetchCount: 1,
      failedUris: [],
      timedOut: false,
    });
    expect(Image.prefetch).toHaveBeenCalledTimes(1);
  });
});
