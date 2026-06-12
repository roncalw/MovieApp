import { Platform } from 'react-native';
import type {
  AppVersionResponse,
  InstalledAppVersion,
  UpdateCheckResult,
} from '../types/appVersion/appVersionTypes';

/*
 * Store-version API client and comparison logic.
 *
 * Imported by:
 * - src/drawer/SettingsScreen.tsx imports fetchStoreAppVersion and
 *   getUpdateCheckResult.
 *
 * Next file in UI flow:
 * - Control returns to src/drawer/SettingsScreen.tsx after this file fetches
 *   the store data and calculates the update message.
 *
 * Calls next outside the app:
 * - fetchStoreAppVersion calls the Cloudflare Worker /app-version/latest
 *   endpoint.
 * - getUpdateCheckResult calls local platform and version comparison helpers.
 *
 * Code flow:
 * 1. SettingsScreen calls fetchStoreAppVersion when Settings opens or when the
 *    user taps the update row.
 * 2. fetchStoreAppVersion asks the Cloudflare Worker for the latest
 *    public iOS and Android store versions.
 * 3. SettingsScreen passes that response plus the installed version from
 *    installedAppVersion.ts into getUpdateCheckResult.
 * 4. getUpdateCheckResult returns the message Settings should show, such as
 *    "Up to date", "Update available", or "Newer than store".
 *
 * Platform rule:
 * Android uses versionCode because Google Play exposes a numeric release code.
 * iOS uses semantic version text because Apple's lookup API exposes the public
 * store version string.
 */

const APP_VERSION_URL =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/app-version/latest?country=us';

function compareNumber(left: number, right: number) {
  if (left === right) {
    return 0;
  }

  return left > right ? 1 : -1;
}

function compareSemanticVersion(left: string, right: string) {
  const leftParts = left.split('.').map(part => Number(part));
  const rightParts = right.split('.').map(part => Number(part));
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = Number.isFinite(leftParts[index]) ? leftParts[index] : 0;
    const rightPart = Number.isFinite(rightParts[index]) ? rightParts[index] : 0;

    if (leftPart !== rightPart) {
      return compareNumber(leftPart, rightPart);
    }
  }

  return 0;
}

function getPlatformStoreVersion(response: AppVersionResponse) {
  return Platform.OS === 'android' ? response.android ?? null : response.ios ?? null;
}

export async function fetchStoreAppVersion(): Promise<AppVersionResponse> {
  const response = await fetch(APP_VERSION_URL);

  if (!response.ok) {
    throw new Error(`App version endpoint returned HTTP ${response.status}.`);
  }

  return (await response.json()) as AppVersionResponse;
}

export function getUpdateCheckResult(
  installedVersion: InstalledAppVersion | null,
  response: AppVersionResponse | null,
): UpdateCheckResult {
  const storeVersion = response ? getPlatformStoreVersion(response) : null;

  if (!installedVersion || !storeVersion || storeVersion.status !== 'ok') {
    return {
      status: 'unavailable',
      storeVersion,
      message: 'Could not check for updates',
    };
  }

  if (Platform.OS === 'android') {
    const latestVersionCode = storeVersion.latestVersionCode;

    if (
      installedVersion.versionCode === null ||
      typeof latestVersionCode !== 'number'
    ) {
      return {
        status: 'unavailable',
        storeVersion,
        message: 'Could not check for updates',
      };
    }

    const comparison = compareNumber(
      installedVersion.versionCode,
      latestVersionCode,
    );

    if (comparison < 0) {
      return {
        status: 'updateAvailable',
        storeVersion,
        message: 'Update available',
      };
    }

    if (comparison > 0) {
      return {
        status: 'newerThanStore',
        storeVersion,
        message: 'Newer than store',
      };
    }

    return {
      status: 'upToDate',
      storeVersion,
      message: 'Up to date',
    };
  }

  const latestVersion = storeVersion.latestVersion;

  if (!installedVersion.versionName || !latestVersion) {
    return {
      status: 'unavailable',
      storeVersion,
      message: 'Could not check for updates',
    };
  }

  const comparison = compareSemanticVersion(
    installedVersion.versionName,
    latestVersion,
  );

  if (comparison < 0) {
    return {
      status: 'updateAvailable',
      storeVersion,
      message: 'Update available',
    };
  }

  if (comparison > 0) {
    return {
      status: 'newerThanStore',
      storeVersion,
      message: 'Newer than store',
    };
  }

  return {
    status: 'upToDate',
    storeVersion,
    message: 'Up to date',
  };
}
