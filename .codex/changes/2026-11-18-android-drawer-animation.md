# Prevent the Android drawer from restoring an old position

Reanimated 4.3.1 has an upstream animation-state synchronization defect. An old
completed animation can be restored during later screen renders, leaving the
drawer visibly open while its navigation state says it is closed. Advanced Search
submission changes screen state; it does not request the drawer to open.

The app pins Reanimated to 4.3.4, a compatible patch release containing the upstream
correction for stale animated values. React Native 0.84.1 and Worklets 0.8.3 stay
unchanged. The version is exact because newer Reanimated minor releases require
different React Native or Worklets versions. The npm and CocoaPods lockfiles must
travel with this change, and native applications must be rebuilt. A Metro reload
alone cannot replace the native animation library.

References:
- https://github.com/react-navigation/react-navigation/issues/13186
- https://github.com/software-mansion/react-native-reanimated/pull/9527
- https://github.com/software-mansion/react-native-reanimated/releases/tag/4.3.4
- https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/

## Verification

The Android development APK builds and installs successfully with 4.3.4. Saved
emulator data was backed up outside Git before installing over the existing app.
TypeScript and all 10 stored-list regression tests pass.
Three consecutive Android UI cycles passed: navigate to Advanced Search, submit,
open and dismiss the drawer by tapping outside it, and navigate to Favorites.
The drawer also dismissed correctly after backgrounding and resuming the app.

The repository's Ruby lockfile now selects CocoaPods 1.17.0 and Xcodeproj 1.28.1.
Xcodeproj recognizes the existing project object version 70, allowing the full
`bundle exec pod install --project-directory=ios` command to complete. The installed
Pods manifest and Podfile.lock match. CocoaPods regenerated project formatting and
removed empty build-script path arrays; the app's project format stays unchanged.
Both installed iPhone simulator app data folders were backed up outside Git before
the rebuild.
`npm run iphone17promax` then built and launched the development app successfully.
On the iPhone 17 Pro Max simulator, Advanced Search returned results and tapping
outside the open drawer dismissed it correctly. No simulator reset or app
uninstall was performed.
