const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const legacyCodePath = path.resolve(__dirname, '.legacy_code');

function escapePathForRegex(filePath) {
  return filePath.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

const config = {
  resolver: {
    // Hide the copied reference app from Metro so it is not resolved, watched,
    // or treated as part of the current bundle graph.
    blockList: [
      new RegExp(
        `${escapePathForRegex(legacyCodePath)}(?:[\\\\/].*)?$`
      ),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
