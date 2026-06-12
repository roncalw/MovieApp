/*
 * Shared app-version type contracts.
 *
 * The version feature has two data sources:
 * - the installed app build generated at build time
 * - the public store version returned by the Cloudflare app-version endpoint
 *
 * Keeping these types here follows the project convention that cross-module
 * contracts live under src/types instead of inside feature implementation files.
 */

export type InstalledAppVersion = {
  versionName: string;
  buildNumber: string;
  versionCode: number | null;
};

export type UpdateCheckStatus =
  | 'checking'
  | 'upToDate'
  | 'newerThanStore'
  | 'updateAvailable'
  | 'unavailable';

export type StoreAppVersion = {
  status?: string;
  latestVersion?: string | null;
  latestVersionCode?: number | null;
  latestVersionName?: string | null;
  storeUrl?: string | null;
  error?: string;
};

export type AppVersionResponse = {
  ios?: StoreAppVersion;
  android?: StoreAppVersion;
};

export type UpdateCheckResult = {
  status: UpdateCheckStatus;
  storeVersion: StoreAppVersion | null;
  message: string;
};
