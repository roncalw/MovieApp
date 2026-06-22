#!/bin/sh
set -e

cd "$(dirname "$0")/.."
"$NODE_BINARY" scripts/generate-app-build-version.js
