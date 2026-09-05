import { Linking } from 'react-native';
import {
  isSafeStreamingDestination,
  type StreamingLinkResult,
} from '../../api/cloudflare/streamingLinkService';
import type { SubscriptionRoute } from '../../api/cloudflare/subscriptionRoutes';

/**
 * Ask the operating system to open the exact title. A missing provider app
 * rejects openURL, so the same title is then opened through HTTPS. Trying
 * openURL directly avoids relying on installed-app discovery permissions.
 */
export async function launchStreamingProvider(
  result: StreamingLinkResult,
  route: SubscriptionRoute,
  signal?: AbortSignal,
): Promise<'native' | 'web'> {
  if (signal?.aborted) throw new Error('Streaming launch was cancelled.');
  if (
    !result.resolved ||
    result.destinationType !== 'exact' ||
    !isSafeStreamingDestination(result, route)
  ) {
    throw new Error('No safe streaming destination is available.');
  }
  if (result.nativeUrl) {
    try {
      await Linking.openURL(result.nativeUrl);
      return 'native';
    } catch {
      // The provider app is not installed, or the native URL could not be opened.
    }
  }
  if (signal?.aborted) throw new Error('Streaming launch was cancelled.');
  await Linking.openURL(result.webUrl);
  return 'web';
}
