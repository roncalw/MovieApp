import { fetchPersonFamily } from '../src/api/cloudflare/personFamilyService';
import type { PersonFamilyResponse } from '../src/types/movie/personTypes';

describe('Cloudflare person family service', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('sends the TMDB-provided Wikidata ID to the stateless family endpoint', async () => {
    const family: PersonFamilyResponse = {
      wikidataId: 'Q35332',
      spouses: [],
      children: [],
      numberOfChildren: null,
      sourceUrl: 'https://www.wikidata.org/wiki/Q35332',
      fetchedAt: '2026-07-13T12:00:00.000Z',
      cacheMaxAgeSeconds: 604800,
    };
    const mockedFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(family),
    });
    globalThis.fetch = mockedFetch as typeof fetch;

    await expect(fetchPersonFamily('Q35332')).resolves.toEqual(family);
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://movieapp-cloudflare.carlo-roncallo.workers.dev/people/family?wikidataId=Q35332',
    );
  });

  test('rejects unsuccessful Worker responses', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 502 }) as typeof fetch;

    await expect(fetchPersonFamily('Q35332')).rejects.toThrow(
      'Person family lookup failed: 502',
    );
  });
});
