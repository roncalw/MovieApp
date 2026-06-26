#!/usr/bin/env zsh
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

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
