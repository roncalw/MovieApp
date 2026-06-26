#!/usr/bin/env zsh
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT/android"

# Build the Android App Bundle that Google Play expects for release uploads.
./gradlew bundleRelease
