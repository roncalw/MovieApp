#!/usr/bin/env zsh
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

# Read the same iOS Release build settings that Xcode uses for an archive.
# The app target and the notification extension target must agree before upload.
read_ios_setting() {
  local target="$1"
  local setting="$2"

  xcodebuild \
    -project ios/MovieApp.xcodeproj \
    -target "$target" \
    -configuration Release \
    -showBuildSettings 2>/dev/null |
    awk -F' = ' -v key="$setting" '$1 ~ "^[[:space:]]*" key "$" { print $2; exit }'
}

IOS_APP_VERSION="$(read_ios_setting "MovieApp" "MARKETING_VERSION")"
IOS_APP_BUILD="$(read_ios_setting "MovieApp" "CURRENT_PROJECT_VERSION")"
IOS_EXTENSION_VERSION="$(read_ios_setting "OneSignalNotificationServiceExtension" "MARKETING_VERSION")"
IOS_EXTENSION_BUILD="$(read_ios_setting "OneSignalNotificationServiceExtension" "CURRENT_PROJECT_VERSION")"

# Android stores its upload number and user-facing version in Gradle.
ANDROID_VERSION_CODE="$(awk '/^[[:space:]]*versionCode[[:space:]]+/ { print $2; exit }' android/app/build.gradle)"
ANDROID_VERSION_NAME="$(awk -F'"' '/^[[:space:]]*versionName[[:space:]]+"/ { print $2; exit }' android/app/build.gradle)"

echo "iOS Version:"
echo "  * Movie App ${IOS_APP_VERSION} (${IOS_APP_BUILD})"
echo "  * OneSignal Extension ${IOS_EXTENSION_VERSION} (${IOS_EXTENSION_BUILD})"
echo
echo "Android Version:"
echo "  * Movie App ${ANDROID_VERSION_CODE} (${ANDROID_VERSION_NAME})"
echo
