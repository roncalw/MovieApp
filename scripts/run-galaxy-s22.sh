#!/usr/bin/env zsh
set -euo pipefail

AVD_NAME="Galaxy_S22_API_34"
ADB_DEVICE_ID="emulator-5554"
ADB_PORT="5554"

emulator_started_by_this_task=0
emulator_pid=""

if adb devices | awk -v device_id="${ADB_DEVICE_ID}" '$1 == device_id { found = 1 } END { exit found ? 0 : 1 }'; then
  echo "${AVD_NAME} is already visible as ${ADB_DEVICE_ID}; reusing the running emulator."
else
  # Keep the emulator as a live child of this VS Code task. If the task shell
  # exits immediately after installing the app, VS Code/macOS can also close
  # the emulator it started. Waiting on the emulator process below makes this
  # task behave like an app session instead of a short install command.
  echo "Starting ${AVD_NAME} on ${ADB_DEVICE_ID}."
  emulator -avd "${AVD_NAME}" -port "${ADB_PORT}" -no-snapshot-load &
  emulator_pid="$!"
  emulator_started_by_this_task=1
fi

adb -s "${ADB_DEVICE_ID}" wait-for-device
npx react-native run-android --device "${ADB_DEVICE_ID}"

if [[ "${emulator_started_by_this_task}" == "1" ]]; then
  echo "${AVD_NAME} is still running. This task will stay open until the emulator window is closed."
  wait "${emulator_pid}"
fi
