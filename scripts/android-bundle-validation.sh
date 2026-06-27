#!/usr/bin/env zsh
set -euo pipefail

# Validate the release identity and upload signature of the AAB produced by
# scripts/androidbundle.sh. This script intentionally does not inspect 16 KB
# native-library alignment or native debug symbols; those are separate audits.

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AAB_FILE="$APP_ROOT/android/app/build/outputs/bundle/release/app-release.aab"
APP_GRADLE_FILE="$APP_ROOT/android/app/build.gradle"
ROOT_GRADLE_FILE="$APP_ROOT/android/build.gradle"
GRADLE_PROPERTIES_FILE="$APP_ROOT/android/gradle.properties"

BUNDLETOOL_VERSION="1.18.1"
BUNDLETOOL_SHA256="675786493983787ffa11550bdb7c0715679a44e1643f3ff980a529e9c822595c"
BUNDLETOOL_CACHE_DIR="$HOME/Library/Caches/MovieApp/bundletool"
BUNDLETOOL_JAR="$BUNDLETOOL_CACHE_DIR/bundletool-all-$BUNDLETOOL_VERSION.jar"
BUNDLETOOL_URL="https://github.com/google/bundletool/releases/download/$BUNDLETOOL_VERSION/bundletool-all-$BUNDLETOOL_VERSION.jar"

FAILURE_COUNT=0
TEMP_DIR=""

pass() {
  print -r -- "PASS  $1"
}

fail() {
  print -r -- "FAIL  $1"
  (( FAILURE_COUNT += 1 ))
}

check_value() {
  local label="$1"
  local actual="$2"
  local expected="$3"

  if [[ "$actual" == "$expected" ]]; then
    pass "$label: $actual"
  else
    fail "$label: found '$actual'; expected '$expected'"
  fi
}

read_property() {
  local property_name="$1"
  sed -n "s/^${property_name}=//p" "$GRADLE_PROPERTIES_FILE" | tail -n 1
}

cleanup() {
  [[ -n "$TEMP_DIR" ]] && rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

print -r -- ""
print -r -- "ANDROID APP BUNDLE VALIDATION"
print -r -- "================================"

if [[ ! -f "$AAB_FILE" ]]; then
  print -r -- "FAIL  Android App Bundle was not found:"
  print -r -- "      $AAB_FILE"
  exit 1
fi

# Display the exact artifact being inspected. The modification time makes an
# accidentally reused bundle easy to recognize before uploading it.
BUNDLE_MODIFIED="$(stat -f '%Sm' -t '%Y-%m-%d %I:%M:%S %p %Z' "$AAB_FILE")"
BUNDLE_SIZE="$(du -h "$AAB_FILE" | awk '{print $1}')"
print -r -- "Bundle:    $AAB_FILE"
print -r -- "Date/Time: $BUNDLE_MODIFIED"
print -r -- "Size:      $BUNDLE_SIZE"
print -r -- ""

# bundletool reads the compiled manifest inside the AAB. Reading the finished
# bundle is stronger than merely repeating values from the Gradle source files.
mkdir -p "$BUNDLETOOL_CACHE_DIR"
if [[ ! -f "$BUNDLETOOL_JAR" ]] ||
   [[ "$(shasum -a 256 "$BUNDLETOOL_JAR" | awk '{print $1}')" != "$BUNDLETOOL_SHA256" ]]; then
  print -r -- "Downloading Google's bundletool $BUNDLETOOL_VERSION for the first validation run..."
  DOWNLOAD_FILE="$BUNDLETOOL_JAR.download"
  rm -f "$DOWNLOAD_FILE"
  curl -fL --retry 3 --progress-bar -o "$DOWNLOAD_FILE" "$BUNDLETOOL_URL"

  DOWNLOADED_SHA256="$(shasum -a 256 "$DOWNLOAD_FILE" | awk '{print $1}')"
  if [[ "$DOWNLOADED_SHA256" != "$BUNDLETOOL_SHA256" ]]; then
    rm -f "$DOWNLOAD_FILE"
    print -r -- "FAIL  Downloaded bundletool did not match its expected SHA-256 fingerprint."
    exit 1
  fi

  mv "$DOWNLOAD_FILE" "$BUNDLETOOL_JAR"
fi

TEMP_DIR="$(mktemp -d /tmp/movieapp-aab-validation.XXXXXX)"
COMPILED_MANIFEST="$TEMP_DIR/AndroidManifest.xml"
java -jar "$BUNDLETOOL_JAR" dump manifest \
  --bundle "$AAB_FILE" \
  --module base > "$COMPILED_MANIFEST"

EXPECTED_PACKAGE="$(sed -nE 's/^[[:space:]]*applicationId[[:space:]]+"([^"]+)".*/\1/p' "$APP_GRADLE_FILE" | head -n 1)"
EXPECTED_VERSION_CODE="$(sed -nE 's/^[[:space:]]*versionCode[[:space:]]+([0-9]+).*/\1/p' "$APP_GRADLE_FILE" | head -n 1)"
EXPECTED_VERSION_NAME="$(sed -nE 's/^[[:space:]]*versionName[[:space:]]+"([^"]+)".*/\1/p' "$APP_GRADLE_FILE" | head -n 1)"
EXPECTED_MINIMUM_API="$(sed -nE 's/^[[:space:]]*minSdkVersion[[:space:]]*=[[:space:]]*([0-9]+).*/\1/p' "$ROOT_GRADLE_FILE" | head -n 1)"
EXPECTED_TARGET_API="$(sed -nE 's/^[[:space:]]*targetSdkVersion[[:space:]]*=[[:space:]]*([0-9]+).*/\1/p' "$ROOT_GRADLE_FILE" | head -n 1)"

ACTUAL_PACKAGE="$(xmllint --xpath 'string(/*[local-name()="manifest"]/@package)' "$COMPILED_MANIFEST")"
ACTUAL_VERSION_CODE="$(xmllint --xpath 'string(/*[local-name()="manifest"]/@*[local-name()="versionCode"])' "$COMPILED_MANIFEST")"
ACTUAL_VERSION_NAME="$(xmllint --xpath 'string(/*[local-name()="manifest"]/@*[local-name()="versionName"])' "$COMPILED_MANIFEST")"
ACTUAL_MINIMUM_API="$(xmllint --xpath 'string(/*[local-name()="manifest"]/*[local-name()="uses-sdk"]/@*[local-name()="minSdkVersion"])' "$COMPILED_MANIFEST")"
ACTUAL_TARGET_API="$(xmllint --xpath 'string(/*[local-name()="manifest"]/*[local-name()="uses-sdk"]/@*[local-name()="targetSdkVersion"])' "$COMPILED_MANIFEST")"
ACTUAL_DEBUGGABLE="$(xmllint --xpath 'string(/*[local-name()="manifest"]/*[local-name()="application"]/@*[local-name()="debuggable"])' "$COMPILED_MANIFEST")"
ACTUAL_TEST_ONLY="$(xmllint --xpath 'string(/*[local-name()="manifest"]/*[local-name()="application"]/@*[local-name()="testOnly"])' "$COMPILED_MANIFEST")"

# Android treats omitted debuggable and testOnly attributes as false. Normalize
# those omitted values so the report shows the effective release behavior.
[[ -z "$ACTUAL_DEBUGGABLE" ]] && ACTUAL_DEBUGGABLE="false"
[[ -z "$ACTUAL_TEST_ONLY" ]] && ACTUAL_TEST_ONLY="false"

print -r -- "COMPILED APPLICATION IDENTITY"
print -r -- "-----------------------------"
check_value "Package" "$ACTUAL_PACKAGE" "$EXPECTED_PACKAGE"
check_value "Version code" "$ACTUAL_VERSION_CODE" "$EXPECTED_VERSION_CODE"
check_value "Version name" "$ACTUAL_VERSION_NAME" "$EXPECTED_VERSION_NAME"
check_value "Minimum API" "$ACTUAL_MINIMUM_API" "$EXPECTED_MINIMUM_API"
check_value "Target API" "$ACTUAL_TARGET_API" "$EXPECTED_TARGET_API"
check_value "debuggable" "$ACTUAL_DEBUGGABLE" "false"
check_value "testOnly" "$ACTUAL_TEST_ONLY" "false"
print -r -- ""
print -r -- "Target API explanation:"
print -r -- "  Target API $ACTUAL_TARGET_API means MovieApp declares that it is designed for"
print -r -- "  the Android behavior and security rules associated with API $ACTUAL_TARGET_API."
print -r -- "  It is not the oldest supported Android version. Minimum API"
print -r -- "  $ACTUAL_MINIMUM_API determines the oldest Android version that can install MovieApp."
print -r -- ""

# An AAB is JAR-signed with the upload key before Google Play receives it.
# jarsigner is already installed with this Mac's Java development kit.
print -r -- "UPLOAD SIGNATURE"
print -r -- "----------------"
if ! command -v jarsigner >/dev/null 2>&1; then
  fail "jarsigner is unavailable; install a Java development kit before validating the AAB"
elif JARSIGNER_OUTPUT="$(jarsigner -verify "$AAB_FILE" 2>&1)" &&
     [[ "$JARSIGNER_OUTPUT" == *"jar verified."* ]]; then
  pass "AAB cryptographic signature is internally valid"
else
  fail "AAB cryptographic signature verification failed"
fi

if ! command -v keytool >/dev/null 2>&1; then
  fail "keytool is unavailable; the AAB signer cannot be compared with the configured upload key"
else
  BUNDLE_CERTIFICATE="$(keytool -printcert -jarfile "$AAB_FILE" 2>/dev/null)"
  BUNDLE_SIGNER="$(print -r -- "$BUNDLE_CERTIFICATE" | sed -n 's/^Owner: //p' | head -n 1)"
  BUNDLE_VALIDITY="$(print -r -- "$BUNDLE_CERTIFICATE" | sed -n 's/^Valid from: //p' | head -n 1)"
  BUNDLE_FINGERPRINT="$(print -r -- "$BUNDLE_CERTIFICATE" | sed -n 's/^[[:space:]]*SHA256: //p' | head -n 1)"

  print -r -- "Signer:      $BUNDLE_SIGNER"
  print -r -- "SHA-256:     $BUNDLE_FINGERPRINT"
  print -r -- "Certificate: $BUNDLE_VALIDITY"

  UPLOAD_STORE_FILE="$(read_property MYAPP_UPLOAD_STORE_FILE)"
  UPLOAD_KEY_ALIAS="$(read_property MYAPP_UPLOAD_KEY_ALIAS)"
  UPLOAD_STORE_PASSWORD="$(read_property MYAPP_UPLOAD_STORE_PASSWORD)"

  if [[ "$UPLOAD_STORE_FILE" == /* ]]; then
    UPLOAD_KEYSTORE="$UPLOAD_STORE_FILE"
  else
    UPLOAD_KEYSTORE="$APP_ROOT/android/app/$UPLOAD_STORE_FILE"
  fi

  if [[ ! -f "$UPLOAD_KEYSTORE" ]]; then
    fail "Configured upload keystore was not found: $UPLOAD_KEYSTORE"
  elif [[ -z "$UPLOAD_KEY_ALIAS" || -z "$UPLOAD_STORE_PASSWORD" ]]; then
    fail "Upload keystore alias or store password is missing from android/gradle.properties"
  else
    export UPLOAD_STORE_PASSWORD
    if KEYSTORE_CERTIFICATE="$(keytool -list -v \
        -keystore "$UPLOAD_KEYSTORE" \
        -alias "$UPLOAD_KEY_ALIAS" \
        -storepass:env UPLOAD_STORE_PASSWORD 2>/dev/null)"; then
      KEYSTORE_FINGERPRINT="$(print -r -- "$KEYSTORE_CERTIFICATE" | sed -n 's/^[[:space:]]*SHA256: //p' | head -n 1)"
      if [[ "$BUNDLE_FINGERPRINT" == "$KEYSTORE_FINGERPRINT" && -n "$BUNDLE_FINGERPRINT" ]]; then
        pass "AAB signer matches configured upload-key alias '$UPLOAD_KEY_ALIAS'"
      else
        fail "AAB signer does not match configured upload-key alias '$UPLOAD_KEY_ALIAS'"
      fi
    else
      fail "Configured upload-key certificate could not be read"
    fi
    unset UPLOAD_STORE_PASSWORD
  fi
fi

print -r -- ""
if (( FAILURE_COUNT == 0 )); then
  print -r -- "RESULT: PASS — the requested Android bundle checks passed."
  exit 0
fi

print -r -- "RESULT: FAIL — $FAILURE_COUNT requested check(s) failed."
exit 1
