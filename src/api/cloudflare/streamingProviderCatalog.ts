/** Exact movie destination formats accepted by MovieApp and its Worker. */
import type { PlaybackPlatform, SubscriptionRoute } from './subscriptionRoutes';
export type StreamingProvider = PlaybackPlatform;
export type ProviderDestination = {
  providerContentId: string;
  webUrl: string;
  nativeUrl: string | null;
};
export type ProviderAdapter = {
  provider: StreamingProvider;
  name: string;
  service: string | null;
  wikidataProperties: readonly string[];
};
export const providerAdapters: readonly ProviderAdapter[] = [
  {
    provider: 'netflix',
    name: 'Netflix',
    service: 'netflix',
    wikidataProperties: ['P1874'],
  },
  {
    provider: 'hulu',
    name: 'Hulu',
    service: 'hulu',
    wikidataProperties: ['P6466'],
  },
  {
    provider: 'prime',
    name: 'Prime Video',
    service: 'prime',
    wikidataProperties: ['P8055', 'P14440', 'P14462'],
  },
  {
    provider: 'max',
    name: 'Max',
    service: 'hbo',
    wikidataProperties: ['P8298'],
  },
  {
    provider: 'youtube',
    name: 'YouTube',
    service: null,
    wikidataProperties: ['P953'],
  },
  {
    provider: 'disney',
    name: 'Disney+',
    service: 'disney',
    wikidataProperties: ['P13902'],
  },
  {
    provider: 'apple',
    name: 'Apple TV+',
    service: 'apple',
    wikidataProperties: ['P9586'],
  },
  {
    provider: 'peacock',
    name: 'Peacock',
    service: 'peacock',
    wikidataProperties: ['P11815'],
  },
  {
    provider: 'amc',
    name: 'AMC+',
    service: 'amc',
    wikidataProperties: ['P953'],
  },
  {
    provider: 'paramount',
    name: 'Paramount+',
    service: 'paramount',
    wikidataProperties: ['P13147'],
  },
  {
    provider: 'starz',
    name: 'STARZ',
    service: 'starz',
    wikidataProperties: ['P953'],
  },
  {
    provider: 'roku',
    name: 'The Roku Channel',
    service: 'roku',
    wikidataProperties: ['P953'],
  },
  {
    provider: 'mubi',
    name: 'MUBI',
    service: 'mubi',
    wikidataProperties: [],
  },
  {
    provider: 'britbox',
    name: 'BritBox',
    service: 'britbox',
    wikidataProperties: [],
  },
  {
    provider: 'curiosity',
    name: 'Curiosity Stream',
    service: 'curiosity',
    wikidataProperties: [],
  },
  {
    provider: 'discovery',
    name: 'Discovery+',
    service: 'discovery',
    wikidataProperties: [],
  },
  {
    provider: 'plutotv',
    name: 'Pluto TV',
    service: 'plutotv',
    wikidataProperties: [],
  },
  {
    provider: 'tubi',
    name: 'Tubi TV',
    service: 'tubi',
    wikidataProperties: [],
  },
  {
    provider: 'crunchyroll',
    name: 'Crunchyroll',
    service: 'crunchyroll',
    wikidataProperties: [],
  },
  {
    provider: 'criterion',
    name: 'The Criterion Channel',
    service: 'criterion',
    wikidataProperties: [],
  },
];
export function adapterForRoute(
  route: SubscriptionRoute,
): ProviderAdapter | undefined {
  return providerAdapters.find(
    adapter => adapter.provider === route.playbackPlatform,
  );
}
export function safeHttpsUrl(value: unknown): URL | null {
  if (typeof value !== 'string' || value.length > 2048 || /[\s\\]/.test(value))
    return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port
      ? url
      : null;
  } catch {
    return null;
  }
}
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const slug = '[a-zA-Z0-9%._~-]+';
const matchPath = (path: string, pattern: string) =>
  path.match(new RegExp('^' + pattern + '/?$'));

export function destinationFromUrl(
  provider: StreamingProvider,
  value: unknown,
): ProviderDestination | null {
  const url = safeHttpsUrl(value);
  if (!url) return null;
  const host = url.hostname;
  const path = url.pathname;
  let id: string | undefined;
  let webUrl = url.origin + path;
  let nativeUrl: string | null = null;
  switch (provider) {
    case 'netflix':
      if (!['netflix.com', 'www.netflix.com'].includes(host)) return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}(?:-[a-z]{2})?/)?(?:title|watch)/([1-9]\\d{5,7})',
      )?.[1];
      if (id) {
        webUrl = `https://www.netflix.com/title/${id}`;
        nativeUrl = `nflx://www.netflix.com/watch/${id}`;
      }
      break;
    case 'hulu':
      if (!['hulu.com', 'www.hulu.com'].includes(host)) return null;
      id = matchPath(
        path,
        '/(?:movie|watch)/(?:' + slug + '-)?(' + uuid + ')',
      )?.[1];
      break;
    case 'prime':
      if (
        ['primevideo.com', 'www.primevideo.com', 'app.primevideo.com'].includes(
          host,
        )
      ) {
        id = matchPath(
          path,
          '/(?:[a-z]{2}(?:-[a-z]{2})?/)?detail/(?:' +
            slug +
            '/)?([A-Z0-9]{10}|[A-Z0-9]{26}|amzn1\\.dv\\.gti\\.' +
            uuid +
            ')',
        )?.[1];
        if (
          !id &&
          path === '/detail' &&
          url.searchParams.getAll('gti').length === 1
        ) {
          const gti = url.searchParams.get('gti')!;
          if (new RegExp('^amzn1\\.dv\\.gti\\.' + uuid + '$').test(gti)) {
            id = gti;
            webUrl = 'https://www.primevideo.com/detail/' + gti;
          }
        }
      } else if (
        [
          'amazon.com',
          'www.amazon.com',
          'www.amazon.co.uk',
          'www.amazon.de',
          'www.amazon.co.jp',
        ].includes(host)
      ) {
        id = matchPath(
          path,
          '/(?:gp/video/detail|dp)/([A-Z0-9]{10}|[A-Z0-9]{26})',
        )?.[1];
        if (id) webUrl = `https://www.primevideo.com/detail/${id}`;
      }
      break;
    case 'max':
      if (
        ![
          'www.hbomax.com',
          'play.hbomax.com',
          'www.max.com',
          'play.max.com',
        ].includes(host)
      )
        return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}(?:/[a-z]{2})?/)?(?:movie|movies)/(?:' +
          slug +
          '/)?(' +
          uuid +
          ')',
      )?.[1];
      break;
    case 'youtube':
      if (
        ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host) &&
        path === '/watch' &&
        url.searchParams.getAll('v').length === 1
      ) {
        const videoId = url.searchParams.get('v')!;
        if (/^[A-Za-z0-9_-]{11}$/.test(videoId)) id = videoId;
      } else if (host === 'youtu.be')
        id = matchPath(path, '/([A-Za-z0-9_-]{11})')?.[1];
      if (id) webUrl = `https://www.youtube.com/watch?v=${id}`;
      break;
    case 'disney':
      if (!['disneyplus.com', 'www.disneyplus.com'].includes(host)) return null;
      // "page-" IDs may describe a collection, so only individual entities qualify.
      id = matchPath(
        path,
        '/(?:[a-z]{2}(?:-[a-z]{2})?/)?browse/(entity-' + uuid + ')',
      )?.[1];
      if (!id)
        id = matchPath(
          path,
          '/(?:[a-z]{2}(?:-[a-z]{2})?/)?movies/' + slug + '/([A-Za-z0-9]{12})',
        )?.[1];
      break;
    case 'apple':
      if (host !== 'tv.apple.com') return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}/)?movie/(?:' + slug + '/)?(umc\\.cmc\\.[a-z0-9]{22,25})',
      )?.[1];
      if (url.searchParams.has('playableId')) {
        const playableId = url.searchParams.get('playableId')!;
        if (
          url.searchParams.getAll('playableId').length !== 1 ||
          !/^tvs\.sbd\.\d{2,12}:[A-Za-z0-9._~-]{1,128}$/.test(playableId)
        )
          return null;
        webUrl += `?playableId=${encodeURIComponent(playableId)}`;
      }
      break;
    case 'starz':
      if (!['starz.com', 'www.starz.com'].includes(host)) return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}/[a-z]{2}/)?movies/(?:' + slug + '-)?([1-9][0-9]{3,9})',
      )?.[1];
      break;
    case 'roku':
      if (host !== 'therokuchannel.roku.com') return null;
      id = matchPath(path, '/details/([0-9a-f]{32})')?.[1];
      break;
    case 'peacock':
      if (!['peacocktv.com', 'www.peacocktv.com'].includes(host)) return null;
      id = matchPath(
        path,
        '/(?:watch/asset|watch-online)/movies/' + slug + '/(' + uuid + ')',
      )?.[1];
      if (!id) {
        const movieSlug = matchPath(path, '/stream-movies/(' + slug + ')')?.[1];
        if (movieSlug) id = 'movies/' + movieSlug;
      }
      if (id && path.startsWith('/watch/asset/movies/')) {
        // Peacock's public title page keeps the same movie asset ID and slug,
        // without sending mobile browsers straight into its web player.
        webUrl =
          'https://www.peacocktv.com' +
          path.replace('/watch/asset/', '/watch-online/');
      }
      break;
    case 'amc':
      if (!['amcplus.com', 'www.amcplus.com'].includes(host)) return null;
      id = matchPath(path, '/movies/' + slug + '--([1-9][0-9]{3,12})')?.[1];
      break;
    case 'paramount':
      if (!['paramountplus.com', 'www.paramountplus.com'].includes(host))
        return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}/)?(?:movies|shows)/video/([A-Za-z0-9_-]{20,64})',
      )?.[1];
      break;
    case 'mubi':
      if (!['mubi.com', 'www.mubi.com'].includes(host)) return null;
      id = matchPath(path, '/(?:[a-z]{2}/[a-z]{2}/)?films/(' + slug + ')')?.[1];
      if (id) webUrl = `https://mubi.com/films/${id}`;
      break;
    case 'britbox':
      if (!['britbox.com', 'www.britbox.com'].includes(host)) return null;
      id = matchPath(path, '/us/movie/([A-Za-z0-9%._~()-]+)')?.[1];
      break;
    case 'curiosity':
      if (!['curiositystream.com', 'www.curiositystream.com'].includes(host))
        return null;
      id = matchPath(path, '/title/video/([1-9][0-9]{1,11})')?.[1];
      break;
    case 'discovery':
      if (!['discoveryplus.com', 'www.discoveryplus.com'].includes(host))
        return null;
      id = matchPath(
        path,
        '/(?:movies/' + slug + '/|movie/)(' + uuid + ')',
      )?.[1];
      break;
    case 'plutotv':
      if (!['pluto.tv', 'www.pluto.tv'].includes(host)) return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}/)?(?:movies|on-demand/movies)/([0-9a-f]{24})(?:/details)?',
      )?.[1];
      break;
    case 'tubi':
      if (!['tubitv.com', 'www.tubitv.com'].includes(host)) return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}-[a-z]{2}/)?movies/([1-9][0-9]{5,11})(?:/' + slug + ')?',
      )?.[1];
      break;
    case 'crunchyroll':
      if (!['crunchyroll.com', 'www.crunchyroll.com'].includes(host))
        return null;
      id = matchPath(
        path,
        '/(?:[a-z]{2}(?:-[a-z]{2})?/)?watch/([A-Z0-9]{8,20})(?:/' + slug + ')?',
      )?.[1];
      break;
    case 'criterion':
      if (!['criterionchannel.com', 'www.criterionchannel.com'].includes(host))
        return null;
      id = matchPath(path, '/videos/(' + slug + ')')?.[1];
      break;
  }
  return id ? { providerContentId: id, webUrl, nativeUrl } : null;
}

/** Apple channel links need their own playable offer, not the store's rental offer. */
export function destinationForRouteFromUrl(
  route: SubscriptionRoute,
  value: unknown,
): ProviderDestination | null {
  const adapter = adapterForRoute(route);
  if (!adapter) return null;
  const destination = destinationFromUrl(adapter.provider, value);
  if (!destination) return null;
  if (route.subscriptionCategory === 'apple_tv_channels') {
    const playableId = new URL(destination.webUrl).searchParams.get(
      'playableId',
    );
    if (!playableId) return null;
  }
  return destination;
}

/** Only documented identifier formats can produce a URL without an API link. */
export function destinationFromWikidataValue(
  provider: StreamingProvider,
  property: string,
  value: string,
): ProviderDestination | null {
  let url: string;
  switch (property) {
    case 'P1874':
      url = `https://www.netflix.com/title/${value}`;
      break;
    case 'P6466':
      url = `https://www.hulu.com/movie/${value}`;
      break;
    case 'P8055':
      url = `https://www.amazon.com/gp/video/detail/${value}`;
      break;
    case 'P14462':
    case 'P14440':
      url = `https://www.primevideo.com/detail/${value}`;
      break;
    case 'P8298':
      url = `https://play.hbomax.com/${value}`;
      break;
    case 'P13902':
      url = `https://www.disneyplus.com/browse/${value}`;
      break;
    case 'P9586':
      url = `https://tv.apple.com/movie/${value}`;
      break;
    case 'P11815':
      url = `https://www.peacocktv.com/stream-${value}`;
      break;
    case 'P13147':
      url = `https://www.paramountplus.com/shows/video/${value}/`;
      break;
    // Full-work URLs are useful for services without a dedicated movie property.
    // Deliberately do not accept P1651 (YouTube video ID): it can be a trailer.
    case 'P953':
      url = value;
      break;
    default:
      return null;
  }
  return destinationFromUrl(provider, url);
}
