#!/usr/bin/env zsh
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

# A release record is useful only when it identifies committed source code.
# Stop before Xcode starts if the repository contains any tracked or untracked
# changes. The displayed list tells the developer exactly what must be committed
# or removed before trying again.
if [[ -n "$(git status --porcelain --untracked-files=all)" ]]; then
  echo "Error: The iPhone archive was not started because MovieApp has uncommitted files." >&2
  echo "Commit or remove the following changes, then run the archive command again:" >&2
  git status --short >&2
  exit 1
fi

# Capture the complete 40-character Git commit once, before the archive starts.
# The separate record written after a successful archive will use this value to
# identify the exact committed source code supplied to Xcode.
RELEASE_COMMIT="$(git rev-parse --verify HEAD)"

# Store command-line archives in the same Xcode Organizer location that Xcode uses.
# The date folder matches Xcode's archive grouping, and the timestamp prevents
# one local archive from overwriting another local archive made on the same day.
ARCHIVE_DATE="$(date +%Y-%m-%d)"
ARCHIVE_TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_FOLDER="$HOME/Library/Developer/Xcode/Archives/$ARCHIVE_DATE"
ARCHIVE_FILE="$ARCHIVE_FOLDER/MovieApp-$ARCHIVE_TIMESTAMP.xcarchive"

mkdir -p "$ARCHIVE_FOLDER"

xcodebuild \
  -workspace ios/MovieApp.xcworkspace \
  -scheme MovieApp \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_FILE" \
  archive

# Read the version and build from the finished app rather than assuming the
# source settings were packaged correctly. This code runs only after xcodebuild
# succeeds because set -e stops the script when the archive command fails.
APP_INFO_PLIST="$ARCHIVE_FILE/Products/Applications/MovieApp.app/Info.plist"
if [[ ! -f "$APP_INFO_PLIST" ]]; then
  echo "Error: The archive succeeded, but its MovieApp Info.plist was not found:" >&2
  echo "  $APP_INFO_PLIST" >&2
  exit 1
fi

APP_VERSION="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP_INFO_PLIST")"
APP_BUILD="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$APP_INFO_PLIST")"
COMMIT_RECORD="${ARCHIVE_FILE%.xcarchive}-commit.txt"

# Keep the release record beside the .xcarchive, never inside it. The archive
# remains an ordinary Xcode artifact while the neighboring text file provides a
# readable answer to: which version, build, and commit produced this archive?
{
  print -r -- "Platform: iPhone"
  print -r -- "Version: $APP_VERSION"
  print -r -- "Build: $APP_BUILD"
  print -r -- "Commit: $RELEASE_COMMIT"
  print -r -- "Archive: ${ARCHIVE_FILE:t}"
} > "$COMMIT_RECORD"

print -r -- ""
print -r -- "iPhone archive created:"
print -r -- "  $ARCHIVE_FILE"
print -r -- "Commit record created beside it:"
print -r -- "  $COMMIT_RECORD"
