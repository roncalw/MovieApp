#!/usr/bin/env zsh
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

# A release record is useful only when it identifies committed source code.
# Stop before Gradle starts if the repository contains any tracked or untracked
# changes. The displayed list tells the developer exactly what must be committed
# or removed before trying again.
if [[ -n "$(git status --porcelain --untracked-files=all)" ]]; then
  echo "Error: The Android bundle was not started because MovieApp has uncommitted files." >&2
  echo "Commit or remove the following changes, then run the bundle command again:" >&2
  git status --short >&2
  exit 1
fi

# Capture the complete 40-character Git commit once, before the bundle starts.
# The separate record written after a successful build will use this value to
# identify the exact committed source code supplied to Gradle.
RELEASE_COMMIT="$(git rev-parse --verify HEAD)"

# Build the Android App Bundle that Google Play expects for release uploads.
./android/gradlew -p android bundleRelease

STANDARD_BUNDLE="$APP_ROOT/android/app/build/outputs/bundle/release/app-release.aab"
APP_GRADLE_FILE="$APP_ROOT/android/app/build.gradle"

if [[ ! -f "$STANDARD_BUNDLE" ]]; then
  echo "Error: Gradle succeeded, but the expected Android App Bundle was not found:" >&2
  echo "  $STANDARD_BUNDLE" >&2
  exit 1
fi

# Read the version values that Gradle used and preserve a release-named copy.
# Gradle always rewrites app-release.aab, so the added copy prevents one release
# from silently replacing the artifact produced for an earlier release.
ANDROID_VERSION_CODE="$(awk '/^[[:space:]]*versionCode[[:space:]]+/ { print $2; exit }' "$APP_GRADLE_FILE")"
ANDROID_VERSION_NAME="$(awk -F'\"' '/^[[:space:]]*versionName[[:space:]]+\"/ { print $2; exit }' "$APP_GRADLE_FILE")"
SHORT_COMMIT="${RELEASE_COMMIT[1,7]}"
BUNDLE_FOLDER="${STANDARD_BUNDLE:h}"
RELEASE_BUNDLE="$BUNDLE_FOLDER/MovieApp-${ANDROID_VERSION_NAME}-${ANDROID_VERSION_CODE}-${SHORT_COMMIT}.aab"
COMMIT_RECORD="${RELEASE_BUNDLE%.aab}-commit.txt"

cp "$STANDARD_BUNDLE" "$RELEASE_BUNDLE"

# Keep the release record beside the preserved .aab, never inside it. Google
# Play receives the normal bundle while the neighboring text file provides a
# readable answer to: which version, version code, and commit produced it?
{
  print -r -- "Platform: Android"
  print -r -- "Version: $ANDROID_VERSION_NAME"
  print -r -- "Version Code: $ANDROID_VERSION_CODE"
  print -r -- "Commit: $RELEASE_COMMIT"
  print -r -- "Bundle: ${RELEASE_BUNDLE:t}"
} > "$COMMIT_RECORD"

print -r -- ""
print -r -- "Android App Bundle created:"
print -r -- "  $STANDARD_BUNDLE"
print -r -- "Release-named copy preserved as:"
print -r -- "  $RELEASE_BUNDLE"
print -r -- "Commit record created beside it:"
print -r -- "  $COMMIT_RECORD"
