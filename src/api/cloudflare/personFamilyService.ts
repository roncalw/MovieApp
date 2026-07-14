/**
 * Reads normalized Wikidata family information through MovieApp's Worker.
 *
 * The Worker is a stateless adapter: it calls Wikidata, translates the claims
 * into this app-level response, and caches that response at Cloudflare's edge.
 * It does not read or write MovieApp's D1 database.
 */

import type { PersonFamilyResponse } from '../../types/movie/personTypes';

const CLOUDFLARE_PERSON_FAMILY_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/people/family';

export async function fetchPersonFamily(
  wikidataId: string,
): Promise<PersonFamilyResponse> {
  const query = new URLSearchParams({ wikidataId });
  const response = await fetch(`${CLOUDFLARE_PERSON_FAMILY_URL}?${query}`);

  if (!response.ok) {
    throw new Error(`Person family lookup failed: ${response.status}`);
  }

  return (await response.json()) as PersonFamilyResponse;
}
