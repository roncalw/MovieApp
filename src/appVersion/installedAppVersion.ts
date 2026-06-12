import { Platform } from 'react-native';
import type { InstalledAppVersion } from '../types/appVersion/appVersionTypes';
import { INSTALLED_APP_VERSION } from './generatedBuildVersion';

/*
 * Runtime adapter for the generated installed-version snapshot.
 *
 * Imported by:
 * - src/drawer/SettingsScreen.tsx imports getInstalledAppVersion.
 *
 * Next file in UI flow:
 * - Control returns to src/drawer/SettingsScreen.tsx with the installed
 *   version values.
 *
 * Reads next:
 * - src/appVersion/generatedBuildVersion.ts supplies INSTALLED_APP_VERSION.
 * - src/api/appVersion.ts receives this function's result from SettingsScreen.
 *
 * Code flow:
 * 1. Android Gradle or Xcode generates generatedBuildVersion.ts before the app
 *    build finishes.
 * 2. This file imports that generated snapshot when the JavaScript bundle
 *    loads.
 * 3. getInstalledAppVersion selects only the current platform's values.
 * 4. SettingsScreen passes this result to api/appVersion.ts so it can compare
 *    the installed build with the public store build.
 *
 * This is intentionally TypeScript-only. There is no Kotlin, Swift, or native
 * bridge to maintain for the version check.
 */

export async function getInstalledAppVersion(): Promise<InstalledAppVersion> {
  const platformVersion =
    Platform.OS === 'android'
      ? INSTALLED_APP_VERSION.android
      : INSTALLED_APP_VERSION.ios;

  return {
    versionName: platformVersion.versionName,
    buildNumber: platformVersion.buildNumber,
    versionCode: platformVersion.versionCode,
  };
}
