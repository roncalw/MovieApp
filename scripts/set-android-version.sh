#!/usr/bin/env zsh
set -euo pipefail

# Update MovieApp's Android store version before a Google Play release.
#
# Usage:
#   scripts/set-android-version.sh <version> <version-code>
#
# Example:
#   scripts/set-android-version.sh 3.5.3 82
#
# The first value is the customer-facing version shown by Google Play. The
# second value is Google's always-increasing numeric upload identifier. This
# script changes those two settings in android/app/build.gradle and regenerates
# the tracked version snapshot displayed by MovieApp's Settings page.

if [[ "$#" -ne 2 ]]; then
  echo "Usage: scripts/set-android-version.sh <version> <version-code>" >&2
  exit 1
fi

ANDROID_VERSION="$1"
VERSION_CODE="$2"

# Require the same three-part version format used by MovieApp releases, such as
# 3.5.3. This prevents a typing mistake from being written into build.gradle.
if [[ ! "$ANDROID_VERSION" =~ '^[0-9]+\.[0-9]+\.[0-9]+$' ]]; then
  echo "Error: Android version must contain three numbers, such as 3.5.3." >&2
  exit 1
fi

# Google Play requires versionCode to be a positive whole number. Each uploaded
# release must use a value greater than every version code uploaded previously.
if [[ ! "$VERSION_CODE" =~ '^[1-9][0-9]*$' ]]; then
  echo "Error: Android version code must be a positive whole number, such as 82." >&2
  exit 1
fi

# Resolve the project from this script's own location. The command therefore
# works whether it is launched from the MovieApp folder or another directory.
APP_ROOT="${0:A:h:h}"
BUILD_FILE="$APP_ROOT/android/app/build.gradle"
GENERATED_VERSION_FILE="$APP_ROOT/src/appVersion/generatedBuildVersion.ts"
GENERATOR_SCRIPT="$APP_ROOT/scripts/generate-app-build-version.js"

if [[ ! -f "$BUILD_FILE" ]]; then
  echo "Error: Android build file was not found: $BUILD_FILE" >&2
  exit 1
fi

# The native settings and generated Settings-page snapshot are updated as one
# operation. Require both the existing snapshot and its generator before any
# edit starts so a later failure can restore the exact original files.
if [[ ! -f "$GENERATED_VERSION_FILE" ]]; then
  echo "Error: Generated app-version snapshot was not found: $GENERATED_VERSION_FILE" >&2
  exit 1
fi

if [[ ! -f "$GENERATOR_SCRIPT" ]]; then
  echo "Error: App-version generator was not found: $GENERATOR_SCRIPT" >&2
  exit 1
fi

NODE_BINARY="$(command -v node || true)"
if [[ -z "$NODE_BINARY" ]]; then
  echo "Error: Node.js is required to refresh the Settings-page version snapshot." >&2
  exit 1
fi

# MovieApp should have exactly one versionName and one versionCode assignment.
# Stopping on any other count avoids changing an unexpected or ambiguous file.
VERSION_NAME_COUNT="$({ grep -Ec '^[[:space:]]*versionName[[:space:]]+' "$BUILD_FILE" || true; })"
VERSION_CODE_COUNT="$({ grep -Ec '^[[:space:]]*versionCode[[:space:]]+' "$BUILD_FILE" || true; })"

if [[ "$VERSION_NAME_COUNT" -ne 1 || "$VERSION_CODE_COUNT" -ne 1 ]]; then
  echo "Error: Expected exactly one versionName and one versionCode in $BUILD_FILE." >&2
  echo "Found versionName=$VERSION_NAME_COUNT and versionCode=$VERSION_CODE_COUNT. No changes were kept." >&2
  exit 1
fi

# Keep unchanged temporary copies until the native edits and snapshot generation
# have both succeeded. If any step fails, EXIT cleanup restores both files.
BACKUP_FILE="$(mktemp "${TMPDIR:-/tmp}/movieapp-android-build-gradle.XXXXXX")"
GENERATED_VERSION_BACKUP_FILE="$(mktemp "${TMPDIR:-/tmp}/movieapp-generated-version.XXXXXX")"
cp "$BUILD_FILE" "$BACKUP_FILE"
cp "$GENERATED_VERSION_FILE" "$GENERATED_VERSION_BACKUP_FILE"
VERSION_EDITS_VERIFIED=0

cleanup() {
  if [[ "$VERSION_EDITS_VERIFIED" -eq 0 ]]; then
    cp "$BACKUP_FILE" "$BUILD_FILE"
    cp "$GENERATED_VERSION_BACKUP_FILE" "$GENERATED_VERSION_FILE"
  fi

  rm -f "$BACKUP_FILE"
  rm -f "$GENERATED_VERSION_BACKUP_FILE"
}
trap cleanup EXIT

# Preserve the line indentation while replacing the two Android release values.
sed -E -i '' \
  "s/^([[:space:]]*)versionName[[:space:]]+[\"'][^\"']+[\"'][[:space:]]*$/\\1versionName \"${ANDROID_VERSION}\"/" \
  "$BUILD_FILE"

sed -E -i '' \
  "s/^([[:space:]]*)versionCode[[:space:]]+[0-9]+[[:space:]]*$/\\1versionCode ${VERSION_CODE}/" \
  "$BUILD_FILE"

# Confirm the file now contains exactly the values requested by the user. The
# periods are escaped because they must mean literal periods during the search.
ANDROID_VERSION_REGEX="${ANDROID_VERSION//./\\.}"
UPDATED_VERSION_NAME_COUNT="$({ grep -Ec "^[[:space:]]*versionName[[:space:]]+\"${ANDROID_VERSION_REGEX}\"[[:space:]]*$" "$BUILD_FILE" || true; })"
UPDATED_VERSION_CODE_COUNT="$({ grep -Ec "^[[:space:]]*versionCode[[:space:]]+${VERSION_CODE}[[:space:]]*$" "$BUILD_FILE" || true; })"

if [[ "$UPDATED_VERSION_NAME_COUNT" -ne 1 || "$UPDATED_VERSION_CODE_COUNT" -ne 1 ]]; then
  echo "Error: Android version changes could not be verified. The original version files were restored." >&2
  exit 1
fi

# Refresh the tracked snapshot now, before the release commit. The iOS Archive
# and Android Bundle tasks intentionally do not regenerate it, so this version
# command is the only supported way to synchronize the Android native settings
# with the app-facing snapshot.
(
  cd "$APP_ROOT"
  "$NODE_BINARY" "$GENERATOR_SCRIPT"
)

VERSION_EDITS_VERIFIED=1

echo "Updated the Android store version:"
echo "  Version:      $ANDROID_VERSION"
echo "  Version code: $VERSION_CODE"
echo "Updated the Settings-page version snapshot:"
echo "  $GENERATED_VERSION_FILE"
