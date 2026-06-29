#!/usr/bin/env zsh
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

XCODE_ARCHIVES_ROOT="$HOME/Library/Developer/Xcode/Archives"
DSYM_CACHE_ROOT="$XCODE_ARCHIVES_ROOT/dSYMs"

latest_archive() {
  local latest

  latest="$(
    find "$XCODE_ARCHIVES_ROOT" -name '*.xcarchive' -type d -print0 |
      xargs -0 stat -f '%m	%N' 2>/dev/null |
      sort -n |
      tail -1 |
      cut -f2- || true
  )"

  if [[ -z "$latest" ]]; then
    echo "No Xcode archive was found under $XCODE_ARCHIVES_ROOT." >&2
    exit 1
  fi

  echo "$latest"
}

read_react_native_version() {
  awk -F'"' '/"version":/ { print $4; exit }' node_modules/react-native/package.json
}

read_hermes_version() {
  awk '
    /:tag: hermes-v/ {
      sub(/^.*hermes-v/, "")
      print
      exit
    }
    /^[[:space:]]*- hermes-engine \(/ {
      sub(/^.*hermes-engine \(/, "")
      sub(/\):.*$/, "")
      print
      exit
    }
  ' ios/Podfile.lock
}

framework_info_plist_version() {
  local framework_dir="$1"
  local plist="$framework_dir/Info.plist"

  if [[ ! -f "$plist" ]]; then
    echo "unknown"
    return
  fi

  /usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$plist" 2>/dev/null ||
    echo "unknown"
}

plist_value() {
  local plist="$1"
  local key="$2"

  /usr/libexec/PlistBuddy -c "Print :$key" "$plist" 2>/dev/null ||
    echo "unknown"
}

relative_to_archive() {
  local item="$1"

  echo "${item#$ARCHIVE_PATH/}"
}

validate_archive_bundle_versions() {
  local app_plist="$APP_BUNDLE/Info.plist"
  local app_name
  local app_version
  local app_build
  local nested_bundle
  local nested_plist
  local nested_name
  local nested_version
  local nested_build
  local answer

  app_name="$(plist_value "$app_plist" "CFBundleName")"
  app_version="$(plist_value "$app_plist" "CFBundleShortVersionString")"
  app_build="$(plist_value "$app_plist" "CFBundleVersion")"
  bundle_mismatch_count=0

  echo "Archive bundle version check:"
  echo "  Main app: $app_name $app_version ($app_build)"
  echo "  Bundle: $(relative_to_archive "$APP_BUNDLE")"
  echo

  while IFS= read -r -d $'\0' nested_bundle <&3; do
    nested_plist="$nested_bundle/Info.plist"

    if [[ ! -f "$nested_plist" ]]; then
      continue
    fi

    nested_name="$(plist_value "$nested_plist" "CFBundleName")"
    nested_version="$(plist_value "$nested_plist" "CFBundleShortVersionString")"
    nested_build="$(plist_value "$nested_plist" "CFBundleVersion")"

    echo "  Nested bundle: $nested_name $nested_version ($nested_build)"
    echo "  Bundle: $(relative_to_archive "$nested_bundle")"

    if [[ "$nested_version" != "$app_version" || "$nested_build" != "$app_build" ]]; then
      bundle_mismatch_count=$((bundle_mismatch_count + 1))
      echo "  MISMATCH: expected $app_version ($app_build), found $nested_version ($nested_build)."
    else
      echo "  OK: version/build matches the main app."
    fi

    echo
  done 3< <(
    find "$APP_BUNDLE" -mindepth 1 \
      -path "$APP_BUNDLE/Frameworks" -prune -o \
      \( -name '*.appex' -o -name '*.app' \) -type d -print0
  )

  if [[ "$bundle_mismatch_count" -eq 0 ]]; then
    echo "Archive bundle version check complete. All discovered app/extension bundles match."
    echo
    return
  fi

  echo "Archive bundle version mismatch found in $bundle_mismatch_count nested bundle(s)."
  printf "Continue archive validation anyway? [y/N] "
  read -r answer || answer=""

  case "${answer:l}" in
    y|yes)
      echo "Continuing despite bundle version mismatch."
      echo
      ;;
    *)
      echo "Stopped because archive bundle versions do not match."
      exit 1
      ;;
  esac
}

framework_version_label() {
  local framework_name="$1"
  local framework_dir="$2"
  local plist_version

  plist_version="$(framework_info_plist_version "$framework_dir")"

  case "$framework_name" in
    hermesvm)
      echo "Hermes $HERMES_VERSION; framework Info.plist $plist_version"
      ;;
    React*|ReactNative*)
      echo "React Native $REACT_NATIVE_VERSION; framework Info.plist $plist_version"
      ;;
    *)
      echo "framework Info.plist $plist_version"
      ;;
  esac
}

extract_uuids() {
  local binary_or_dsym="$1"

  dwarfdump --uuid "$binary_or_dsym" 2>/dev/null |
    awk '/UUID:/ { print tolower($2) }' |
    sort -u
}

dsym_matches_binary() {
  local binary="$1"
  local dsym="$2"
  local binary_uuids
  local dsym_uuids
  local uuid

  binary_uuids="$(extract_uuids "$binary")"
  dsym_uuids="$(extract_uuids "$dsym")"

  if [[ -z "$binary_uuids" || -z "$dsym_uuids" ]]; then
    return 1
  fi

  while IFS= read -r uuid; do
    if ! grep -qi "^$uuid$" <<<"$dsym_uuids"; then
      return 1
    fi
  done <<<"$binary_uuids"

  return 0
}

selected_dsym_source_specs() {
  local framework_name="$1"

  case "$framework_name" in
    hermesvm)
      echo "Hermes $HERMES_VERSION|$DSYM_CACHE_ROOT/Hermes/$HERMES_VERSION|$HERMES_ARTIFACT_URL"
      ;;
    React)
      echo "React Native $REACT_NATIVE_VERSION core|$DSYM_CACHE_ROOT/React/$REACT_NATIVE_CACHE_VERSION|$REACT_ARTIFACT_URL"
      ;;
    ReactNativeDependencies)
      echo "React Native $REACT_NATIVE_VERSION dependencies|$DSYM_CACHE_ROOT/React/$REACT_NATIVE_CACHE_VERSION|$REACT_NATIVE_DEPENDENCIES_ARTIFACT_URL"
      ;;
    *)
      echo "React Native $REACT_NATIVE_VERSION core|$DSYM_CACHE_ROOT/React/$REACT_NATIVE_CACHE_VERSION|$REACT_ARTIFACT_URL"
      echo "React Native $REACT_NATIVE_VERSION dependencies|$DSYM_CACHE_ROOT/React/$REACT_NATIVE_CACHE_VERSION|$REACT_NATIVE_DEPENDENCIES_ARTIFACT_URL"
      echo "Hermes $HERMES_VERSION|$DSYM_CACHE_ROOT/Hermes/$HERMES_VERSION|$HERMES_ARTIFACT_URL"
      ;;
  esac
}

find_current_version_cached_dsym() {
  local framework_name="$1"
  local dsym_name="$2"
  local binary_path="$3"
  local source_spec
  local source_label
  local remainder
  local cache_parent
  local cached_dsym
  local checked_cache_parents=":"

  while IFS= read -r source_spec; do
    source_label="${source_spec%%|*}"
    remainder="${source_spec#*|}"
    cache_parent="${remainder%%|*}"
    cached_dsym="$cache_parent/$dsym_name"

    if [[ "$checked_cache_parents" == *":$cache_parent:"* ]]; then
      continue
    fi
    checked_cache_parents="$checked_cache_parents$cache_parent:"

    echo "Checking current-version cache for $source_label:" >&2
    echo "  $cached_dsym" >&2

    if [[ -d "$cached_dsym" ]] && dsym_matches_binary "$binary_path" "$cached_dsym"; then
      echo "$cached_dsym"
      return 0
    fi
  done < <(selected_dsym_source_specs "$framework_name")

  return 1
}

maven_urls_for_message() {
  local framework_name="$1"

  case "$framework_name" in
    hermesvm)
      echo "$HERMES_ARTIFACT_URL"
      ;;
    React)
      echo "$REACT_ARTIFACT_URL"
      ;;
    ReactNativeDependencies)
      echo "$REACT_NATIVE_DEPENDENCIES_ARTIFACT_URL"
      ;;
    *)
      # Unknown future React Native frameworks are not hardcoded here.
      # If one appears, the installer searches the known React Native and Hermes
      # dSYM source archives below and verifies UUIDs before copying anything.
      echo "$REACT_ARTIFACT_URL | $REACT_NATIVE_DEPENDENCIES_ARTIFACT_URL | $HERMES_ARTIFACT_URL"
      ;;
  esac
}

download_matching_dsym_from_maven() {
  local framework_name="$1"
  local dsym_name="$2"
  local binary_path="$3"
  local source_spec
  local source_label
  local remainder
  local cache_parent
  local url
  local temp_dir
  local downloaded_archive
  local extracted_dsym
  local cached_dsym

  while IFS= read -r source_spec; do
    source_label="${source_spec%%|*}"
    remainder="${source_spec#*|}"
    cache_parent="${remainder%%|*}"
    url="${remainder#*|}"

    echo "Searching Maven source: $source_label" >&2
    temp_dir="$(mktemp -d)"
    downloaded_archive="$temp_dir/dsym.tar.gz"

    if ! curl -fL "$url" -o "$downloaded_archive"; then
      echo "Could not download $url" >&2
      rm -rf "$temp_dir"
      continue
    fi

    if ! tar -xzf "$downloaded_archive" -C "$temp_dir"; then
      echo "Could not extract $url" >&2
      rm -rf "$temp_dir"
      continue
    fi

    extracted_dsym="$(find "$temp_dir" -name "$dsym_name" -type d -print -quit)"

    if [[ -z "$extracted_dsym" ]]; then
      rm -rf "$temp_dir"
      continue
    fi

    if ! dsym_matches_binary "$binary_path" "$extracted_dsym"; then
      echo "Found $dsym_name in $source_label, but its UUID did not match this archive." >&2
      rm -rf "$temp_dir"
      continue
    fi

    cached_dsym="$cache_parent/$dsym_name"
    echo "Creating current-version dSYM cache folder if needed:" >&2
    echo "  $cache_parent" >&2
    mkdir -p "$cache_parent"
    ditto "$extracted_dsym" "$cached_dsym"
    rm -rf "$temp_dir"

    echo "$cached_dsym"
    return 0
  done < <(selected_dsym_source_specs "$framework_name")

  return 1
}

copy_dsym_to_archive() {
  local source_dsym="$1"
  local archive_dsym="$2"

  rm -rf "$archive_dsym"
  ditto "$source_dsym" "$archive_dsym"
}

install_missing_dsym() {
  local dsym_name="$1"
  local binary_path="$2"
  local archive_dsym="$3"
  local framework_name="${dsym_name%.framework.dSYM}"
  local source_dsym

  if source_dsym="$(find_current_version_cached_dsym "$framework_name" "$dsym_name" "$binary_path")"; then
    echo "Using cached dSYM: $source_dsym"
  else
    echo "No matching current-version cached dSYM found."
    echo "Downloading and searching Maven dSYM archives for the current React Native/Hermes versions..."

    if ! source_dsym="$(download_matching_dsym_from_maven "$framework_name" "$dsym_name" "$binary_path")"; then
      echo "No downloaded Maven dSYM matched $dsym_name for this archive." >&2
      return 1
    fi

    echo "Saved cached dSYM: $source_dsym"
  fi

  copy_dsym_to_archive "$source_dsym" "$archive_dsym"

  if ! dsym_matches_binary "$binary_path" "$archive_dsym"; then
    echo "Copied dSYM, but its UUID still does not match $binary_path." >&2
    return 1
  fi

  echo "Installed: $archive_dsym"
}

validate_framework_dsym() {
  local framework_dir="$1"
  local framework_name
  local binary_path
  local archive_dsym
  local dsym_name
  local issue
  local answer

  framework_name="$(basename "$framework_dir" .framework)"
  binary_path="$framework_dir/$framework_name"
  dsym_name="$framework_name.framework.dSYM"
  archive_dsym="$ARCHIVE_DSYM_DIR/$dsym_name"

  if [[ ! -f "$binary_path" ]]; then
    echo "Skipped $framework_name.framework because no framework binary was found."
    echo
    return
  fi

  checked_count=$((checked_count + 1))

  if [[ -d "$archive_dsym" ]] && dsym_matches_binary "$binary_path" "$archive_dsym"; then
    echo "OK: $framework_name.framework has a matching dSYM in the archive."
    echo
    return
  fi

  issue="missing"
  if [[ -d "$archive_dsym" ]]; then
    issue="present, but its UUID does not match the framework binary"
  fi

  issue_count=$((issue_count + 1))

  echo "Missing dSYM for framework: $framework_name.framework"
  echo "  Binary: $binary_path"
  echo "  Expected archive dSYM: $archive_dsym"
  echo "  Issue: $dsym_name is $issue."
  echo "  Version: $(framework_version_label "$framework_name" "$framework_dir")"
  echo "  Maven dSYM URL(s): $(maven_urls_for_message "$framework_name")"
  printf "Install this dSYM into the archive now? [y/N] "
  read -r answer || answer=""

  case "${answer:l}" in
    y|yes)
      if ! install_missing_dsym "$dsym_name" "$binary_path" "$archive_dsym"; then
        unresolved_count=$((unresolved_count + 1))
        return 1
      fi
      ;;
    *)
      echo "Skipped install for $dsym_name."
      unresolved_count=$((unresolved_count + 1))
      ;;
  esac

  echo
}

ARCHIVE_PATH="${1:-$(latest_archive)}"

if [[ ! -d "$ARCHIVE_PATH" ]]; then
  echo "Archive folder does not exist: $ARCHIVE_PATH" >&2
  exit 1
fi

APP_BUNDLE="$(find "$ARCHIVE_PATH/Products/Applications" -maxdepth 1 -name '*.app' -type d | sort | head -1)"

if [[ -z "$APP_BUNDLE" ]]; then
  echo "Could not find an app bundle inside archive: $ARCHIVE_PATH" >&2
  exit 1
fi

ARCHIVE_DSYM_DIR="$ARCHIVE_PATH/dSYMs"
mkdir -p "$ARCHIVE_DSYM_DIR"

REACT_NATIVE_VERSION="$(read_react_native_version)"
REACT_NATIVE_CACHE_VERSION="${REACT_NATIVE_VERSION#0.}"
HERMES_VERSION="$(read_hermes_version)"

if [[ -z "$REACT_NATIVE_VERSION" || -z "$HERMES_VERSION" ]]; then
  echo "Could not read React Native or Hermes version numbers." >&2
  exit 1
fi

REACT_ARTIFACT_URL="https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/$REACT_NATIVE_VERSION/react-native-artifacts-$REACT_NATIVE_VERSION-reactnative-core-dSYM-release.tar.gz"
REACT_NATIVE_DEPENDENCIES_ARTIFACT_URL="https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/$REACT_NATIVE_VERSION/react-native-artifacts-$REACT_NATIVE_VERSION-reactnative-dependencies-dSYM-release.tar.gz"
HERMES_ARTIFACT_URL="https://repo1.maven.org/maven2/com/facebook/hermes/hermes-ios/$HERMES_VERSION/hermes-ios-$HERMES_VERSION-hermes-framework-dSYM-release.tar.gz"

checked_count=0
issue_count=0
unresolved_count=0
bundle_mismatch_count=0

echo "Archive being validated:"
echo "  $ARCHIVE_PATH"
echo

validate_archive_bundle_versions

echo "dSYM cache folder:"
echo "  $DSYM_CACHE_ROOT"
echo

echo "Searching for missing dSYMs based on all frameworks from:"
echo "  $APP_BUNDLE"
echo

while IFS= read -r -d $'\0' framework_dir <&3; do
  validate_framework_dsym "$framework_dir"
done 3< <(find "$APP_BUNDLE" -name '*.framework' -type d -print0)

echo
echo "Frameworks checked: $checked_count"
echo "dSYM issues found: $issue_count"

if [[ "$unresolved_count" -eq 0 ]]; then
  echo "Archive dSYM validation complete. All embedded frameworks have matching dSYMs."
else
  echo "Archive dSYM validation incomplete. $unresolved_count dSYM install was skipped or failed." >&2
  exit 1
fi
