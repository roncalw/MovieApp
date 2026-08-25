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

# Android does not provide a permanent archive history comparable to Xcode's.
# Create that history under Library/Developer, using the same date grouping as
# Xcode and one timestamped folder for every successful Android bundle command.
# The folder is created only after Gradle succeeds, so a failed build does not
# leave behind an empty archive entry.
BUNDLE_ARCHIVE_DATE="$(date +%Y-%m-%d)"
BUNDLE_ARCHIVE_TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ANDROID_ARCHIVES_ROOT="$HOME/Library/Developer/Android/Archives"
BUNDLE_ARCHIVE_FOLDER="$ANDROID_ARCHIVES_ROOT/$BUNDLE_ARCHIVE_DATE/MovieApp-$BUNDLE_ARCHIVE_TIMESTAMP"

# Build the Android App Bundle that Google Play expects for release uploads.
./android/gradlew -p android bundleRelease

STANDARD_BUNDLE="$APP_ROOT/android/app/build/outputs/bundle/release/app-release.aab"
APP_GRADLE_FILE="$APP_ROOT/android/app/build.gradle"

if [[ ! -f "$STANDARD_BUNDLE" ]]; then
  echo "Error: Gradle succeeded, but the expected Android App Bundle was not found:" >&2
  echo "  $STANDARD_BUNDLE" >&2
  exit 1
fi

# Read the version values that Gradle used. Gradle always rewrites
# app-release.aab, so copy the finished bundle into the permanent archive folder
# before another build can replace it.
ANDROID_VERSION_CODE="$(awk '/^[[:space:]]*versionCode[[:space:]]+/ { print $2; exit }' "$APP_GRADLE_FILE")"
ANDROID_VERSION_NAME="$(awk -F'\"' '/^[[:space:]]*versionName[[:space:]]+\"/ { print $2; exit }' "$APP_GRADLE_FILE")"
ARCHIVED_BUNDLE="$BUNDLE_ARCHIVE_FOLDER/MovieApp-${ANDROID_VERSION_NAME}-${ANDROID_VERSION_CODE}.aab"
COMMIT_RECORD="$BUNDLE_ARCHIVE_FOLDER/MovieApp-${ANDROID_VERSION_NAME}-${ANDROID_VERSION_CODE}-commit.txt"

mkdir -p "$BUNDLE_ARCHIVE_FOLDER"
cp "$STANDARD_BUNDLE" "$ARCHIVED_BUNDLE"

# Keep the release record beside the archived .aab, never inside it. The commit
# stays in the text record instead of the bundle filename, matching the iPhone
# archive approach and keeping the artifact name easy to read.
{
  print -r -- "Platform: Android"
  print -r -- "Version: $ANDROID_VERSION_NAME"
  print -r -- "Version Code: $ANDROID_VERSION_CODE"
  print -r -- "Commit: $RELEASE_COMMIT"
  print -r -- "Bundle: ${ARCHIVED_BUNDLE:t}"
} > "$COMMIT_RECORD"

print -r -- ""
print -r -- "Android App Bundle created:"
print -r -- "  $STANDARD_BUNDLE"
print -r -- "Permanent Android bundle archive created:"
print -r -- "  $BUNDLE_ARCHIVE_FOLDER"
print -r -- "Archived bundle:"
print -r -- "  $ARCHIVED_BUNDLE"
print -r -- "Commit record created beside it:"
print -r -- "  $COMMIT_RECORD"
