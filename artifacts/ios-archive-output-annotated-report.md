<h1 style="color:#008000;">Annotated iOS Archive Output Report</h1>

<p style="color:#008000;"><strong>Source:</strong> The 796-line terminal transcript supplied after the June 26, 2026 MovieApp archive.</p>

<p style="color:#008000;"><strong>Reading rule:</strong> Every word from the supplied transcript appears below exactly once and remains inside a plain-text block. Green text is explanatory commentary written for this report. Consecutive paragraphs that repeat the same operation are preserved together and explained once, as requested.</p>

<p style="color:#008000;"><strong>Overall result:</strong> The archive succeeded with no build errors. The transcript contains warnings and notes, but none stopped archive creation. Framework dSYM completeness remains a separate, post-archive validation responsibility.</p>

<p style="color:#008000;"><strong>High-level metaphor:</strong> Xcode successfully assembled, labeled, inspected, and sealed the MovieApp shipping crate. The dSYMs are the separate maps investigators need after a crash; the crate can be complete enough to ship even when a supplier's maps still need to be inserted before upload.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 1 — Xcode settings and React Native bundle setup</h2>
```text
rklets\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/react-native/ReactCommon\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/react-native/ReactCommon/jsitooling\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/boost\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/boost-for-react-native\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/glog\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/RCT-Folly\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/React-hermes\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/hermes-engine\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/react-native/ReactCommon\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/react-native/ReactCommon/jsitooling\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Private/React-Core\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Private/React-Core\"\ \"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Private/Yoga\"
    export HERMES_CLI_PATH\=/Users/croncallo/repo/MovieApp/node_modules/hermes-compiler/hermesc/osx-bin/hermesc
    export HOME\=/Users/croncallo
    export HOST_ARCH\=arm64
    export HOST_PLATFORM\=macosx
    export ICONV\=/usr/bin/iconv
    export IMPLICIT_DEPENDENCY_DOMAIN\=default
    export INDEX_ENABLE_DATA_STORE\=NO
    export INDEX_STORE_COMPRESS\=NO
    export INDEX_STORE_ONLY_PROJECT_FILES\=NO
    export INFOPLIST_ENABLE_CFBUNDLEICONS_MERGE\=YES
    export INFOPLIST_EXPAND_BUILD_SETTINGS\=YES
    export INFOPLIST_FILE\=MovieApp/Info.plist
    export INFOPLIST_KEY_CFBundleDisplayName\=Movie\ Time
    export INFOPLIST_KEY_LSApplicationCategoryType\=public.app-category.reference
    export INFOPLIST_OUTPUT_FORMAT\=binary
    export INFOPLIST_PATH\=MovieApp.app/Info.plist
    export INFOPLIST_PREPROCESS\=NO
    export INFOSTRINGS_PATH\=MovieApp.app/en.lproj/InfoPlist.strings
    export INLINE_PRIVATE_FRAMEWORKS\=NO
    export INSTALLAPI_IGNORE_SKIP_INSTALL\=YES
    export INSTALLHDRS_COPY_PHASE\=NO
    export INSTALLHDRS_SCRIPT_PHASE\=NO
    export INSTALL_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications
    export INSTALL_GROUP\=staff
    export INSTALL_MODE_FLAG\=u+w,go-w,a+rX
    export INSTALL_OWNER\=croncallo
    export INSTALL_PATH\=/Applications
    export INSTALL_ROOT\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation
    export IPHONEOS_DEPLOYMENT_TARGET\=15.1
    export IS_UNOPTIMIZED_BUILD\=NO
    export JAVAC_DEFAULT_FLAGS\=-J-Xms64m\ -J-XX:NewSize\=4M\ -J-Dfile.encoding\=UTF8
    export JAVA_APP_STUB\=/System/Library/Frameworks/JavaVM.framework/Resources/MacOS/JavaApplicationStub
    export JAVA_ARCHIVE_CLASSES\=YES
    export JAVA_ARCHIVE_TYPE\=JAR
    export JAVA_COMPILER\=/usr/bin/javac
    export JAVA_FOLDER_PATH\=MovieApp.app/Java
    export JAVA_FRAMEWORK_RESOURCES_DIRS\=Resources
    export JAVA_JAR_FLAGS\=cv
    export JAVA_SOURCE_SUBDIR\=.
    export JAVA_USE_DEPENDENCIES\=YES
    export JAVA_ZIP_FLAGS\=-urg
    export JIKES_DEFAULT_FLAGS\=+E\ +OLDCSO
    export KASAN_CFLAGS_CLASSIC\=-DKASAN\=1\ -DKASAN_CLASSIC\=1\ -fsanitize\=address\ -mllvm\ -asan-globals-live-support\ -mllvm\ -asan-force-dynamic-shadow
    export KASAN_CFLAGS_TBI\=-DKASAN\=1\ -DKASAN_TBI\=1\ -fsanitize\=kernel-hwaddress\ -mllvm\ -hwasan-recover\=0\ -mllvm\ -hwasan-instrument-atomics\=0\ -mllvm\ -hwasan-instrument-stack\=1\ -mllvm\ -hwasan-generate-tags-with-calls\=1\ -mllvm\ -hwasan-instrument-with-calls\=1\ -mllvm\ -hwasan-use-short-granules\=0\ -mllvm\ -hwasan-memory-access-callback-prefix\=__asan_
    export KASAN_DEFAULT_CFLAGS\=-DKASAN\=1\ -DKASAN_CLASSIC\=1\ -fsanitize\=address\ -mllvm\ -asan-globals-live-support\ -mllvm\ -asan-force-dynamic-shadow
    export KEEP_PRIVATE_EXTERNS\=NO
    export LD_DEPENDENCY_INFO_FILE\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/undefined_arch/MovieApp_dependency_info.dat
    export LD_EXPORT_SYMBOLS\=YES
    export LD_GENERATE_MAP_FILE\=NO
    export LD_MAP_FILE_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/MovieApp-LinkMap-normal-undefined_arch.txt
    export LD_NO_PIE\=NO
    export LD_QUOTE_LINKER_ARGUMENTS_FOR_COMPILER_DRIVER\=YES
    export LD_RUNPATH_SEARCH_PATHS\=/usr/lib/swift\ \ /usr/lib/swift\ \'@executable_path/Frameworks\'\ \'@loader_path/Frameworks\'\ @executable_path/Frameworks
    export LD_RUNPATH_SEARCH_PATHS_YES\=@loader_path/../Frameworks
    export LD_SHARED_CACHE_ELIGIBLE\=Automatic
    export LD_WARN_DUPLICATE_LIBRARIES\=NO
    export LD_WARN_UNUSED_DYLIBS\=NO
    export LEGACY_DEVELOPER_DIR\=/Applications/Xcode.app/Contents/PlugIns/Xcode3Core.ideplugin/Contents/SharedSupport/Developer
    export LEX\=lex
    export LIBRARY_DEXT_INSTALL_PATH\=/Library/DriverExtensions
    export LIBRARY_FLAG_NOSPACE\=YES
    export LIBRARY_FLAG_PREFIX\=-l
    export LIBRARY_KEXT_INSTALL_PATH\=/Library/Extensions
    export LIBRARY_SEARCH_PATHS\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos\ /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk/usr/lib/swift\ /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/AsyncStorage\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RCTSwiftUI\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RCTSwiftUIWrapper\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNGestureHandler\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNReanimated\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNScreens\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNWorklets\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/ReactAppDependencyProvider\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/ReactCodegen\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/react-native-date-picker\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/react-native-onesignal\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/react-native-safe-area-context\ /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/react-native-webview\ /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos\ /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk/usr/lib/swift
    export LINKER_DISPLAYS_MANGLED_NAMES\=NO
    export LINK_FILE_LIST_normal_arm64\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/arm64/MovieApp.LinkFileList
    export LINK_OBJC_RUNTIME\=YES
    export LINK_WITH_STANDARD_LIBRARIES\=YES
    export LLVM_TARGET_TRIPLE_OS_VERSION\=ios15.1
    export LLVM_TARGET_TRIPLE_VENDOR\=apple
    export LM_AUX_CONST_METADATA_LIST_PATH_normal_arm64\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/arm64/MovieApp.SwiftConstValuesFileList
    export LOCALIZATION_EXPORT_SUPPORTED\=YES
    export LOCALIZATION_PREFERS_STRING_CATALOGS\=NO
    export LOCALIZED_RESOURCES_FOLDER_PATH\=MovieApp.app/en.lproj
    export LOCALIZED_STRING_CODE_COMMENTS\=NO
    export LOCALIZED_STRING_MACRO_NAMES\=NSLocalizedString\ CFCopyLocalizedString
    export LOCALIZED_STRING_SWIFTUI_SUPPORT\=YES
    export LOCAL_ADMIN_APPS_DIR\=/Applications/Utilities
    export LOCAL_APPS_DIR\=/Applications
    export LOCAL_DEVELOPER_DIR\=/Library/Developer
    export LOCAL_LIBRARY_DIR\=/Library
    export LOCROOT\=/Users/croncallo/repo/MovieApp/ios
    export LOCSYMROOT\=/Users/croncallo/repo/MovieApp/ios
    export MACH_O_TYPE\=mh_execute
    export MAC_OS_X_PRODUCT_BUILD_VERSION\=25F80
    export MAC_OS_X_VERSION_ACTUAL\=260501
    export MAC_OS_X_VERSION_MAJOR\=260000
    export MAC_OS_X_VERSION_MINOR\=260500
    export MAKE_MERGEABLE\=NO
    export MARKETING_VERSION\=3.3.1
    export MERGEABLE_LIBRARY\=NO
    export MERGED_BINARY_TYPE\=none
    export MERGE_LINKED_LIBRARIES\=NO
    export MESSAGES_APPLICATION_EXTENSION_SUPPORT_FOLDER_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/MessagesApplicationExtensionSupport
    export MESSAGES_APPLICATION_SUPPORT_FOLDER_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/MessagesApplicationSupport
    export METAL_LIBRARY_FILE_BASE\=default
    export METAL_LIBRARY_OUTPUT_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app
    export MODULES_FOLDER_PATH\=MovieApp.app/Modules
    export MODULE_CACHE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/ModuleCache.noindex
    export MTL_ENABLE_DEBUG_INFO\=NO
    export NATIVE_ARCH\=arm64
    export NATIVE_ARCH_32_BIT\=arm
    export NATIVE_ARCH_64_BIT\=arm64
    export NATIVE_ARCH_ACTUAL\=arm64
    export NO_COMMON\=YES
    export OBJECT_FILE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects
    export OBJECT_FILE_DIR_normal\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal
    export OBJROOT\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath
    export ONLY_ACTIVE_ARCH\=NO
    export OS\=MACOS
    export OSAC\=/usr/bin/osacompile
    export OTHER_CFLAGS\=\ -DRCT_REMOVE_LEGACY_ARCH\=1\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/AsyncStorage/AsyncStorage.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RCTSwiftUI/RCTSwiftUI.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNScreens/RNScreens.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/ReactAppDependencyProvider/ReactAppDependencyProvider.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/ReactCodegen/ReactCodegen.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/reanimated/RNReanimated.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/worklets/RNWorklets.modulemap\"\ \ -DRCT_REMOVE_LEGACY_ARCH\=1\ \ -DREACT_NATIVE_MINOR_VERSION\=84\ \ -DRCT_REMOVE_LEGACY_ARCH\=1\ \ -DREACT_NATIVE_MINOR_VERSION\=84\ -DREANIMATED_VERSION\=4.3.1\ \ -DREANIMATED_FEATURE_FLAGS\=\"\[RUNTIME_TEST_FLAG:false\]\[DISABLE_COMMIT_PAUSING_MECHANISM:false\]\[ANDROID_SYNCHRONOUSLY_UPDATE_UI_PROPS:false\]\[IOS_SYNCHRONOUSLY_UPDATE_UI_PROPS:false\]\[EXPERIMENTAL_CSS_ANIMATIONS_FOR_SVG_COMPONENTS:false\]\[USE_SYNCHRONIZABLE_FOR_MUTABLES:true\]\[USE_COMMIT_HOOK_ONLY_FOR_REACT_COMMITS:true\]\[ENABLE_SHARED_ELEMENT_TRANSITIONS:false\]\[FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS:true\]\"\ -DNDEBUG
    export OTHER_CPLUSPLUSFLAGS\=\ -DRCT_REMOVE_LEGACY_ARCH\=1\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/AsyncStorage/AsyncStorage.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RCTSwiftUI/RCTSwiftUI.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNScreens/RNScreens.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/ReactAppDependencyProvider/ReactAppDependencyProvider.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/ReactCodegen/ReactCodegen.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/reanimated/RNReanimated.modulemap\"\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/worklets/RNWorklets.modulemap\"\ \ -DRCT_REMOVE_LEGACY_ARCH\=1\ \ -DREACT_NATIVE_MINOR_VERSION\=84\ \ -DRCT_REMOVE_LEGACY_ARCH\=1\ \ -DREACT_NATIVE_MINOR_VERSION\=84\ -DREANIMATED_VERSION\=4.3.1\ \ -DREANIMATED_FEATURE_FLAGS\=\"\[RUNTIME_TEST_FLAG:false\]\[DISABLE_COMMIT_PAUSING_MECHANISM:false\]\[ANDROID_SYNCHRONOUSLY_UPDATE_UI_PROPS:false\]\[IOS_SYNCHRONOUSLY_UPDATE_UI_PROPS:false\]\[EXPERIMENTAL_CSS_ANIMATIONS_FOR_SVG_COMPONENTS:false\]\[USE_SYNCHRONIZABLE_FOR_MUTABLES:true\]\[USE_COMMIT_HOOK_ONLY_FOR_REACT_COMMITS:true\]\[ENABLE_SHARED_ELEMENT_TRANSITIONS:false\]\[FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS:true\]\"\ -DNDEBUG\ -DFOLLY_NO_CONFIG\ -DFOLLY_MOBILE\=1\ -DFOLLY_USE_LIBCPP\=1\ -DFOLLY_CFG_NO_COROUTINES\=1\ -DFOLLY_HAVE_CLOCK_GETTIME\=1\ -DRCT_REMOVE_LEGACY_ARCH\=1\ -DNDEBUG\ -DRCT_NEW_ARCH_ENABLED\=1
    export OTHER_LDFLAGS\=\ -ObjC\ -l\"AsyncStorage\"\ -l\"RCTSwiftUI\"\ -l\"RCTSwiftUIWrapper\"\ -l\"RNGestureHandler\"\ -l\"RNReanimated\"\ -l\"RNScreens\"\ -l\"RNWorklets\"\ -l\"ReactAppDependencyProvider\"\ -l\"ReactCodegen\"\ -l\"react-native-date-picker\"\ -l\"react-native-onesignal\"\ -l\"react-native-safe-area-context\"\ -l\"react-native-webview\"\ -framework\ \"Accelerate\"\ -framework\ \"AudioToolbox\"\ -framework\ \"CoreGraphics\"\ -framework\ \"ImageIO\"\ -framework\ \"MobileCoreServices\"\ -framework\ \"OneSignalCore\"\ -framework\ \"OneSignalExtension\"\ -framework\ \"OneSignalFramework\"\ -framework\ \"OneSignalInAppMessages\"\ -framework\ \"OneSignalLiveActivities\"\ -framework\ \"OneSignalLocation\"\ -framework\ \"OneSignalNotifications\"\ -framework\ \"OneSignalOSCore\"\ -framework\ \"OneSignalOutcomes\"\ -framework\ \"OneSignalUser\"\ -framework\ \"QuartzCore\"\ -framework\ \"React\"\ -framework\ \"ReactNativeDependencies\"\ -framework\ \"SharedAsyncStorage\"\ -framework\ \"UIKit\"\ -framework\ \"hermesvm\"\ -weak_framework\ \"JavaScriptCore\"\ -ObjC\ -lc++
    export OTHER_SWIFT_FLAGS\=\ -D\ COCOAPODS\ -Xcc\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/AsyncStorage/AsyncStorage.modulemap\"\ -Xcc\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RCTSwiftUI/RCTSwiftUI.modulemap\"\ -Xcc\ -fmodule-map-file\=\"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNScreens/RNScreens.modulemap\"\ -Xcc\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/ReactAppDependencyProvider/ReactAppDependencyProvider.modulemap\"\ -Xcc\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/ReactCodegen/ReactCodegen.modulemap\"\ -Xcc\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/reanimated/RNReanimated.modulemap\"\ -Xcc\ -fmodule-map-file\=\"/Users/croncallo/repo/MovieApp/ios/Pods/Headers/Public/worklets/RNWorklets.modulemap\"
    export PACKAGE_TYPE\=com.apple.package-type.wrapper.application
    export PASCAL_STRINGS\=YES
    export PATH\=/Applications/Xcode.app/Contents/SharedFrameworks/SwiftBuild.framework/Versions/A/PlugIns/SWBBuildService.bundle/Contents/PlugIns/SWBUniversalPlatformPlugin.bundle/Contents/Frameworks/SWBUniversalPlatform.framework/Resources:/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin:/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/local/bin:/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/libexec:/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/usr/bin:/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/usr/local/bin:/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin:/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/local/bin:/Applications/Xcode.app/Contents/Developer/usr/bin:/Applications/Xcode.app/Contents/Developer/usr/local/bin:/Users/croncallo/.nvm/versions/node/v24.14.0/bin:/Users/croncallo/repo/MovieApp/node_modules/.bin:/Users/croncallo/repo/node_modules/.bin:/Users/croncallo/node_modules/.bin:/Users/node_modules/.bin:/node_modules/.bin:/Users/croncallo/.nvm/versions/node/v24.14.0/lib/node_modules/npm/node_modules/@npmcli/run-script/lib/node-gyp-bin:/Users/croncallo/.sdkman/candidates/java/current/bin:/Users/croncallo/.rbenv/shims:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/pkg/env/global/bin:/Library/Apple/usr/bin:/Users/croncallo/Library/Application\ Support/Code/User/globalStorage/github.copilot-chat/debugCommand:/Users/croncallo/Library/Application\ Support/Code/User/globalStorage/github.copilot-chat/copilotCli:/Users/croncallo/Library/Android/sdk/emulator:/Users/croncallo/Library/Android/sdk/platform-tools
    export PATH_PREFIXES_EXCLUDED_FROM_HEADER_DEPENDENCIES\=/usr/include\ /usr/local/include\ /System/Library/Frameworks\ /System/Library/PrivateFrameworks\ /Applications/Xcode.app/Contents/Developer/Headers\ /Applications/Xcode.app/Contents/Developer/SDKs\ /Applications/Xcode.app/Contents/Developer/Platforms
    export PBDEVELOPMENTPLIST_PATH\=MovieApp.app/pbdevelopment.plist
    export PER_ARCH_MODULE_FILE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/undefined_arch
    export PER_ARCH_OBJECT_FILE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/undefined_arch
    export PER_VARIANT_OBJECT_FILE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal
    export PKGINFO_FILE_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/PkgInfo
    export PKGINFO_PATH\=MovieApp.app/PkgInfo
    export PLATFORM_DEVELOPER_APPLICATIONS_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Applications
    export PLATFORM_DEVELOPER_BIN_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin
    export PLATFORM_DEVELOPER_LIBRARY_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library
    export PLATFORM_DEVELOPER_SDK_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs
    export PLATFORM_DEVELOPER_TOOLS_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Tools
    export PLATFORM_DEVELOPER_USR_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr
    export PLATFORM_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform
    export PLATFORM_DISPLAY_NAME\=iOS
    export PLATFORM_FAMILY_NAME\=iOS
    export PLATFORM_NAME\=iphoneos
    export PLATFORM_PREFERRED_ARCH\=arm64
    export PLATFORM_PRODUCT_BUILD_VERSION\=23F73
    export PLATFORM_REQUIRES_SWIFT_AUTOLINK_EXTRACT\=NO
    export PLATFORM_REQUIRES_SWIFT_MODULEWRAP\=NO
    export PLATFORM_USES_DSYMS\=YES
    export PLIST_FILE_OUTPUT_FORMAT\=binary
    export PLUGINS_FOLDER_PATH\=MovieApp.app/PlugIns
    export PODS_BUILD_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath
    export PODS_CONFIGURATION_BUILD_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos
    export PODS_PODFILE_DIR_PATH\=/Users/croncallo/repo/MovieApp/ios/.
    export PODS_ROOT\=/Users/croncallo/repo/MovieApp/ios/Pods
    export PODS_XCFRAMEWORKS_BUILD_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates
    export PRECOMPS_INCLUDE_HEADERS_FROM_BUILT_PRODUCTS_DIR\=YES
    export PRECOMP_DESTINATION_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/PrefixHeaders
    export PRIVATE_HEADERS_FOLDER_PATH\=MovieApp.app/PrivateHeaders
    export PROCESSED_INFOPLIST_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/undefined_arch/Processed-Info.plist
    export PRODUCT_BUNDLE_IDENTIFIER\=com.codefest.movieapp
    export PRODUCT_BUNDLE_PACKAGE_TYPE\=APPL
    export PRODUCT_MODULE_NAME\=MovieApp
    export PRODUCT_NAME\=MovieApp
    export PRODUCT_SETTINGS_PATH\=/Users/croncallo/repo/MovieApp/ios/MovieApp/Info.plist
    export PRODUCT_TYPE\=com.apple.product-type.application
    export PROFILING_CODE\=NO
    export PROJECT\=MovieApp
    export PROJECT_DERIVED_FILE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/DerivedSources
    export PROJECT_DIR\=/Users/croncallo/repo/MovieApp/ios
    export PROJECT_FILE_PATH\=/Users/croncallo/repo/MovieApp/ios/MovieApp.xcodeproj
    export PROJECT_GUID\=34c141a8719ac195b065e5994d697ebb
    export PROJECT_NAME\=MovieApp
    export PROJECT_TEMP_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build
    export PROJECT_TEMP_ROOT\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath
    export PROVISIONING_PROFILE_REQUIRED\=YES
    export PROVISIONING_PROFILE_REQUIRED_YES_YES\=YES
    export PROVISIONING_PROFILE_SUPPORTED\=YES
    export PUBLIC_HEADERS_FOLDER_PATH\=MovieApp.app/Headers
    export REACT_NATIVE_PATH\=/Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/react-native
    export RECOMMENDED_IPHONEOS_DEPLOYMENT_TARGET\=15.0
    export RECURSIVE_SEARCH_PATHS_FOLLOW_SYMLINKS\=YES
    export REMOVE_CVS_FROM_RESOURCES\=YES
    export REMOVE_GIT_FROM_RESOURCES\=YES
    export REMOVE_HEADERS_FROM_EMBEDDED_BUNDLES\=YES
    export REMOVE_HG_FROM_RESOURCES\=YES
    export REMOVE_STATIC_EXECUTABLES_FROM_EMBEDDED_BUNDLES\=YES
    export REMOVE_SVN_FROM_RESOURCES\=YES
    export RESCHEDULE_INDEPENDENT_HEADERS_PHASES\=YES
    export REZ_COLLECTOR_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/ResourceManagerResources
    export REZ_OBJECTS_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/ResourceManagerResources/Objects
    export REZ_SEARCH_PATHS\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos\ 
    export RPATH_ORIGIN\=@loader_path
    export RUNTIME_EXCEPTION_ALLOW_DYLD_ENVIRONMENT_VARIABLES\=NO
    export RUNTIME_EXCEPTION_ALLOW_JIT\=NO
    export RUNTIME_EXCEPTION_ALLOW_UNSIGNED_EXECUTABLE_MEMORY\=NO
    export RUNTIME_EXCEPTION_DEBUGGING_TOOL\=NO
    export RUNTIME_EXCEPTION_DISABLE_EXECUTABLE_PAGE_PROTECTION\=NO
    export RUNTIME_EXCEPTION_DISABLE_LIBRARY_VALIDATION\=NO
    export SCANNING_PCM_KEEP_CACHE_DIRECTORY\=YES
    export SCAN_ALL_SOURCE_FILES_FOR_INCLUDES\=NO
    export SCRIPTS_FOLDER_PATH\=MovieApp.app/Scripts
    export SCRIPT_INPUT_FILE_0\=/Users/croncallo/repo/MovieApp/ios/.xcode.env.local
    export SCRIPT_INPUT_FILE_1\=/Users/croncallo/repo/MovieApp/ios/.xcode.env
    export SCRIPT_INPUT_FILE_COUNT\=2
    export SCRIPT_INPUT_FILE_LIST_COUNT\=0
    export SCRIPT_OUTPUT_FILE_COUNT\=0
    export SCRIPT_OUTPUT_FILE_LIST_COUNT\=0
    export SDKROOT\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk
    export SDK_DIR\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk
    export SDK_DIR_iphoneos\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk
    export SDK_DIR_iphoneos26_5\=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk
    export SDK_NAME\=iphoneos26.5
    export SDK_NAMES\=iphoneos26.5
    export SDK_PRODUCT_BUILD_VERSION\=23F73
    export SDK_STAT_CACHE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData
    export SDK_STAT_CACHE_ENABLE\=YES
    export SDK_STAT_CACHE_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.5-23F73-32daed1954a7d5dd0789fcaf2a9bb78b.sdkstatcache
    export SDK_VERSION\=26.5
    export SDK_VERSION_ACTUAL\=260500
    export SDK_VERSION_MAJOR\=260000
    export SDK_VERSION_MINOR\=260500
    export SED\=/usr/bin/sed
    export SEPARATE_STRIP\=NO
    export SEPARATE_SYMBOL_EDIT\=NO
    export SET_DIR_MODE_OWNER_GROUP\=YES
    export SET_FILE_MODE_OWNER_GROUP\=NO
    export SHALLOW_BUNDLE\=YES
    export SHALLOW_BUNDLE_TRIPLE\=ios
    export SHALLOW_BUNDLE_ios_macabi\=NO
    export SHALLOW_BUNDLE_macos\=NO
    export SHARED_DERIVED_FILE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/DerivedSources
    export SHARED_FRAMEWORKS_FOLDER_PATH\=MovieApp.app/SharedFrameworks
    export SHARED_PRECOMPS_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/PrecompiledHeaders
    export SHARED_SUPPORT_FOLDER_PATH\=MovieApp.app/SharedSupport
    export SIGNATURE_METADATA_FOLDER_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Signatures
    export SKIP_INSTALL\=NO
    export SKIP_MERGEABLE_LIBRARY_BUNDLE_HOOK\=NO
    export SOURCE_ROOT\=/Users/croncallo/repo/MovieApp/ios
    export SRCROOT\=/Users/croncallo/repo/MovieApp/ios
    export STRINGSDATA_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/undefined_arch
    export STRINGSDATA_ROOT\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build
    export STRINGS_FILE_INFOPLIST_RENAME\=YES
    export STRINGS_FILE_OUTPUT_ENCODING\=binary
    export STRING_CATALOG_GENERATE_SYMBOLS\=NO
    export STRIP_BITCODE_FROM_COPIED_FILES\=YES
    export STRIP_INSTALLED_PRODUCT\=YES
    export STRIP_STYLE\=all
    export STRIP_SWIFT_SYMBOLS\=YES
    export SUPPORTED_DEVICE_FAMILIES\=1,2
    export SUPPORTED_PLATFORMS\=iphoneos\ iphonesimulator
    export SUPPORTS_MACCATALYST\=NO
    export SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD\=YES
    export SUPPORTS_ON_DEMAND_RESOURCES\=YES
    export SUPPORTS_TEXT_BASED_API\=NO
    export SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD\=NO
    export SUPPRESS_WARNINGS\=NO
    export SWIFT_EMIT_CONST_VALUE_PROTOCOLS\=AnyResolverProviding\ AppEntity\ AppEnum\ AppExtension\ AppIntent\ AppIntentsPackage\ AppShortcutProviding\ AppShortcutsProvider\ AppUnionValue\ AppUnionValueCasesProviding\ DynamicOptionsProvider\ EntityQuery\ ExtensionPointDefining\ IntentValueQuery\ Resolver\ TransientEntity\ _AssistantIntentsProvider\ _GenerativeFunctionExtractable\ _IntentValueRepresentable
    export SWIFT_EMIT_LOC_STRINGS\=NO
    export SWIFT_ENABLE_EXPLICIT_MODULES\=NO
    export SWIFT_INCLUDE_PATHS\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos\ \ \"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/AsyncStorage\"\ \"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RCTSwiftUI\"\ \"/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/RNScreens\"
    export SWIFT_PLATFORM_TARGET_PREFIX\=ios
    export SWIFT_RESPONSE_FILE_PATH_normal_arm64\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/arm64/MovieApp.SwiftFileList
    export SWIFT_STDLIB_TOOL_UNSIGNED_DESTINATION_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/SwiftSupport
    export SWIFT_VERSION\=5.0
    export SYMROOT\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath
    export SYSTEM_ADMIN_APPS_DIR\=/Applications/Utilities
    export SYSTEM_APPS_DIR\=/Applications
    export SYSTEM_CORE_SERVICES_DIR\=/System/Library/CoreServices
    export SYSTEM_DEMOS_DIR\=/Applications/Extras
    export SYSTEM_DEVELOPER_APPS_DIR\=/Applications/Xcode.app/Contents/Developer/Applications
    export SYSTEM_DEVELOPER_BIN_DIR\=/Applications/Xcode.app/Contents/Developer/usr/bin
    export SYSTEM_DEVELOPER_DEMOS_DIR\=/Applications/Xcode.app/Contents/Developer/Applications/Utilities/Built\ Examples
    export SYSTEM_DEVELOPER_DIR\=/Applications/Xcode.app/Contents/Developer
    export SYSTEM_DEVELOPER_DOC_DIR\=/Applications/Xcode.app/Contents/Developer/ADC\ Reference\ Library
    export SYSTEM_DEVELOPER_GRAPHICS_TOOLS_DIR\=/Applications/Xcode.app/Contents/Developer/Applications/Graphics\ Tools
    export SYSTEM_DEVELOPER_JAVA_TOOLS_DIR\=/Applications/Xcode.app/Contents/Developer/Applications/Java\ Tools
    export SYSTEM_DEVELOPER_PERFORMANCE_TOOLS_DIR\=/Applications/Xcode.app/Contents/Developer/Applications/Performance\ Tools
    export SYSTEM_DEVELOPER_RELEASENOTES_DIR\=/Applications/Xcode.app/Contents/Developer/ADC\ Reference\ Library/releasenotes
    export SYSTEM_DEVELOPER_TOOLS\=/Applications/Xcode.app/Contents/Developer/Tools
    export SYSTEM_DEVELOPER_TOOLS_DOC_DIR\=/Applications/Xcode.app/Contents/Developer/ADC\ Reference\ Library/documentation/DeveloperTools
    export SYSTEM_DEVELOPER_TOOLS_RELEASENOTES_DIR\=/Applications/Xcode.app/Contents/Developer/ADC\ Reference\ Library/releasenotes/DeveloperTools
    export SYSTEM_DEVELOPER_USR_DIR\=/Applications/Xcode.app/Contents/Developer/usr
    export SYSTEM_DEVELOPER_UTILITIES_DIR\=/Applications/Xcode.app/Contents/Developer/Applications/Utilities
    export SYSTEM_DEXT_INSTALL_PATH\=/System/Library/DriverExtensions
    export SYSTEM_DOCUMENTATION_DIR\=/Library/Documentation
    export SYSTEM_EXTENSIONS_FOLDER_PATH\=MovieApp.app/SystemExtensions
    export SYSTEM_EXTENSIONS_FOLDER_PATH_SHALLOW_BUNDLE_NO\=MovieApp.app/Library/SystemExtensions
    export SYSTEM_EXTENSIONS_FOLDER_PATH_SHALLOW_BUNDLE_YES\=MovieApp.app/SystemExtensions
    export SYSTEM_KEXT_INSTALL_PATH\=/System/Library/Extensions
    export SYSTEM_LIBRARY_DIR\=/System/Library
    export TAPI_DEMANGLE\=YES
    export TAPI_ENABLE_PROJECT_HEADERS\=NO
    export TAPI_LANGUAGE\=objective-c
    export TAPI_LANGUAGE_STANDARD\=compiler-default
    export TAPI_USE_SRCROOT\=YES
    export TAPI_VERIFY_MODE\=Pedantic
    export TARGETED_DEVICE_FAMILY\=1,2
    export TARGETNAME\=MovieApp
    export TARGET_BUILD_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications
    export TARGET_NAME\=MovieApp
    export TARGET_TEMP_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build
    export TEMP_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build
    export TEMP_FILES_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build
    export TEMP_FILE_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build
    export TEMP_ROOT\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath
    export TEMP_SANDBOX_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/TemporaryTaskSandboxes
    export TEST_FRAMEWORK_SEARCH_PATHS\=\ /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks\ /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk/Developer/Library/Frameworks
    export TEST_LIBRARY_SEARCH_PATHS\=\ /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib
    export TOOLCHAINS\=com.apple.dt.toolchain.XcodeDefault
    export TOOLCHAIN_DIR\=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain
    export TREAT_MISSING_BASELINES_AS_TEST_FAILURES\=NO
    export TREAT_MISSING_SCRIPT_PHASE_OUTPUTS_AS_ERRORS\=NO
    export TeamIdentifierPrefix\=KL6M72PXJ6.
    export UID\=501
    export UNINSTALLED_PRODUCTS_DIR\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/UninstalledProducts
    export UNLOCALIZED_RESOURCES_FOLDER_PATH\=MovieApp.app
    export UNLOCALIZED_RESOURCES_FOLDER_PATH_SHALLOW_BUNDLE_NO\=MovieApp.app/Resources
    export UNLOCALIZED_RESOURCES_FOLDER_PATH_SHALLOW_BUNDLE_YES\=MovieApp.app
    export UNSTRIPPED_PRODUCT\=NO
    export USER\=croncallo
    export USER_APPS_DIR\=/Users/croncallo/Applications
    export USER_LIBRARY_DIR\=/Users/croncallo/Library
    export USE_DYNAMIC_NO_PIC\=YES
    export USE_HEADERMAP\=YES
    export USE_HEADER_SYMLINKS\=NO
    export USE_HERMES\=true
    export USE_RECURSIVE_SCRIPT_INPUTS_IN_SCRIPT_PHASES\=YES
    export VALIDATE_DEVELOPMENT_ASSET_PATHS\=YES_ERROR
    export VALIDATE_PRODUCT\=YES
    export VALID_ARCHS\=arm64\ arm64e\ armv7\ armv7s
    export VERBOSE_PBXCP\=NO
    export VERSIONING_SYSTEM\=apple-generic
    export VERSIONPLIST_PATH\=MovieApp.app/version.plist
    export VERSION_INFO_BUILDER\=croncallo
    export VERSION_INFO_FILE\=MovieApp_vers.c
    export VERSION_INFO_STRING\=\"@\(\#\)PROGRAM:MovieApp\ \ PROJECT:MovieApp-3\"
    export WARNING_CFLAGS\=-Wno-comma\ -Wno-shorten-64-to-32
    export WATCHKIT_2_SUPPORT_FOLDER_PATH\=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/WatchKitSupport2
    export WORKSPACE_DIR\=/Users/croncallo/repo/MovieApp/ios
    export WRAPPER_EXTENSION\=app
    export WRAPPER_NAME\=MovieApp.app
    export WRAPPER_SUFFIX\=.app
    export WRAP_ASSET_PACKS_IN_SEPARATE_DIRECTORIES\=NO
    export XCODE_APP_SUPPORT_DIR\=/Applications/Xcode.app/Contents/Developer/Library/Xcode
    export XCODE_PRODUCT_BUILD_VERSION\=17F42
    export XCODE_VERSION_ACTUAL\=2650
    export XCODE_VERSION_MAJOR\=2600
    export XCODE_VERSION_MINOR\=2650
    export XPCSERVICES_FOLDER_PATH\=MovieApp.app/XPCServices
    export YACC\=yacc
    export _DISCOVER_COMMAND_LINE_LINKER_INPUTS\=YES
    export _DISCOVER_COMMAND_LINE_LINKER_INPUTS_INCLUDE_WL\=YES
    export _LD_MULTIARCH\=YES
    export _WRAPPER_CONTENTS_DIR_SHALLOW_BUNDLE_NO\=/Contents
    export _WRAPPER_PARENT_PATH_SHALLOW_BUNDLE_NO\=/..
    export _WRAPPER_RESOURCES_DIR_SHALLOW_BUNDLE_NO\=/Resources
    export __DIAGNOSE_DEPRECATED_ARCHS\=YES
    export __IS_NOT_MACOS\=YES
    export __IS_NOT_MACOS_macosx\=NO
    export __IS_NOT_SIMULATOR\=YES
    export __IS_NOT_SIMULATOR_simulator\=NO
    export __ORIGINAL_SDK_DEFINED_LLVM_TARGET_TRIPLE_SYS\=ios
    export arch\=undefined_arch
    export diagnostic_message_length\=224
    export variant\=normal
    /bin/sh -c /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Script-00DD1BFF1BD5951E006B06BC.sh
Node found at: /Users/croncallo/.nvm/versions/node/v24.14.0/bin/node
+ DEST=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app
+ [[ ! -n '' ]]
+ [[ Release = *Debug* ]]
+ [[ -n '' ]]
+ case "$CONFIGURATION" in
+ DEV=false
+++ dirname /Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/react-native/scripts/react-native-xcode.sh
++ cd /Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/react-native/scripts/..
++ pwd
+ REACT_NATIVE_DIR=/Users/croncallo/repo/MovieApp/node_modules/react-native
+ PROJECT_ROOT=/Users/croncallo/repo/MovieApp/ios/..
+ cd /Users/croncallo/repo/MovieApp/ios/..
+ [[ -n '' ]]
+ [[ -s index.ios.js ]]
+ ENTRY_FILE=index.js
+ source /Users/croncallo/repo/MovieApp/node_modules/react-native/scripts/node-binary.sh
++ '[' -z /Users/croncallo/.nvm/versions/node/v24.14.0/bin/node ']'
++ type /Users/croncallo/.nvm/versions/node/v24.14.0/bin/node
+ HERMES_ENGINE_PATH=/Users/croncallo/repo/MovieApp/ios/Pods/hermes-engine
+ '[' -z /Users/croncallo/repo/MovieApp/node_modules/hermes-compiler/hermesc/osx-bin/hermesc ']'
+ [[ true != false ]]
+ [[ -f /Users/croncallo/repo/MovieApp/ios/Pods/hermes-engine ]]
+ '[' -z '' ']'
+ export NODE_ARGS=
+ NODE_ARGS=
+ '[' -z '' ']'
+ CLI_PATH=/Users/croncallo/repo/MovieApp/node_modules/react-native/scripts/bundle.js
+ '[' -z '' ']'
+ BUNDLE_COMMAND=bundle
+ '[' -z '' ']'
+ COMPOSE_SOURCEMAP_PATH=/Users/croncallo/repo/MovieApp/node_modules/react-native/scripts/compose-source-maps.js
+ [[ -z '' ]]
+ CONFIG_ARG=
+ [[ -z '' ]]
+ BUNDLE_NAME=main
+ BUNDLE_FILE=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle
+ EXTRA_ARGS=()
+ case "$PLATFORM_NAME" in
+ BUNDLE_PLATFORM=ios
+ '[' '' = YES ']'
+ EMIT_SOURCEMAP=
+ [[ ! -z '' ]]
+ PACKAGER_SOURCEMAP_FILE=
+ [[ '' == true ]]
+ [[ true != false ]]
+ [[ false == false ]]
+ EXTRA_ARGS+=("--minify" "false")
+ [[ -n '' ]]
+ [[ -n '' ]]
+ EXTRA_ARGS+=("--config-cmd" "'$NODE_BINARY' $NODE_ARGS '$REACT_NATIVE_DIR/cli.js' config")
+ /Users/croncallo/.nvm/versions/node/v24.14.0/bin/node /Users/croncallo/repo/MovieApp/node_modules/react-native/scripts/bundle.js bundle --entry-file index.js --platform ios --dev false --reset-cache --bundle-output /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle --assets-dest /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app --minify false --config-cmd ''\''/Users/croncallo/.nvm/versions/node/v24.14.0/bin/node'\''  '\''/Users/croncallo/repo/MovieApp/node_modules/react-native/cli.js'\'' config'
```

<p style="color:#008000;"><strong>What this block does:</strong> The supplied transcript begins in the middle of a long Xcode setting, at <code>rklets...</code>. Nothing before that fragment was included in the supplied output, so this report does not invent the missing beginning. The hundreds of <code>export</code> lines that follow are Xcode handing its complete Release-build configuration to the React Native shell script.</p>

<p style="color:#008000;"><strong>Important settings visible here:</strong> MovieApp is being built as an iOS application for physical devices; the active architecture is <code>arm64</code>; the deployment target is iOS 15.1; the SDK is iPhoneOS 26.5; the marketing version is 3.3.1; the bundle identifier is <code>com.codefest.movieapp</code>; Hermes is enabled; React Native minor version 84 is compiled into the flags; and Node was found at <code>/Users/croncallo/.nvm/versions/node/v24.14.0/bin/node</code>. The linker list also names the native libraries and frameworks that will become part of the app, including OneSignal, React, ReactNativeDependencies, and hermesvm.</p>

<p style="color:#008000;"><strong>Meaning of the lines beginning with <code>+</code>:</strong> Shell tracing is enabled. Those lines show the React Native build script making decisions: use the Release configuration, use <code>index.js</code> as the JavaScript entry file, build for iOS, create <code>main.jsbundle</code>, reset Metro's cache, and run Metro with development mode disabled. Metro is asked not to minify the intermediate JavaScript text because Hermes performs the final optimized bytecode compilation later.</p>

<p style="color:#008000;"><strong>Metaphor:</strong> This block is the production crew's master call sheet. It identifies the stage, cast, equipment, destination, and security credentials before anyone starts packing the finished app.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 2 — Metro banner</h2>
```text
                        ▒▒▓▓▓▓▒▒
                     ▒▓▓▓▒▒░░▒▒▓▓▓▒
                  ▒▓▓▓▓░░░▒▒▒▒░░░▓▓▓▓▒
                 ▓▓▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▓▓
                 ▓▓░░░░░▒▓▓▓▓▓▓▒░░░░░▓▓
                 ▓▓░░▓▓▒░░░▒▒░░░▒▓▒░░▓▓
                 ▓▓░░▓▓▓▓▓▒▒▒▒▓▓▓▓▒░░▓▓
                 ▓▓░░▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░▓▓
                 ▓▓▒░░▒▒▓▓▓▓▓▓▓▓▒░░░▒▓▓
                  ▒▓▓▓▒░░░▒▓▓▒░░░▒▓▓▓▒
                     ▒▓▓▓▒░░░░▒▓▓▓▒
                        ▒▒▓▓▓▓▒▒
```

<p style="color:#008000;"><strong>What this block does:</strong> This is only Metro's decorative startup logo. It performs no build work and reports no problem.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 3 — Metro startup status</h2>
```text

 WARN  the transform cache was reset.
                Welcome to Metro v0.83.5
              Fast - Scalable - Integrated
```

<p style="color:#008000;"><strong>What this block does:</strong> Metro confirms that its transform cache was deliberately reset and identifies itself as version 0.83.5. A reset makes Metro rebuild transformed JavaScript instead of trusting older cached results. The word <code>WARN</code> describes the cache reset; it is not an application defect.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 4 — JavaScript bundle, assets, Hermes bytecode, and 22 global-name warnings</h2>
```text

LOG:Writing bundle output to: /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle
LOG:Done writing bundle output
Copying 34 asset files
Done copying assets
+ [[ true == false ]]
+ EXTRA_COMPILER_ARGS=
+ [[ false == true ]]
+ EXTRA_COMPILER_ARGS=-O
+ [[ '' == true ]]
+ /Users/croncallo/repo/MovieApp/node_modules/hermes-compiler/hermesc/osx-bin/hermesc -emit-binary -max-diagnostic-width=80 -O -out /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app/main.jsbundle /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:2772:20: warning: the variable "Promise" was not declared in function "promiseMethodWrapper"
        return new Promise((resolve, reject) => {
                   ^~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:14137:31: warning: the variable "nativeFabricUIManager" was not declared in anonymous function
  var _nativeFabricUIManage = nativeFabricUIManager,
                              ^~~~~~~~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:18390:5: warning: the variable "setImmediate" was not declared in function "handleResolved"
    setImmediate(function () {
    ^~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:20493:29: warning: the variable "performance" was not declared in anonymous arrow function
          this._startTime = performance.now();
                            ^~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:21995:15: warning: the variable "Blob" was not declared in anonymous function
          new Blob();
              ^~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:22134:24: warning: the variable "FileReader" was not declared in function "readBlobAsArrayBuffer"
      var reader = new FileReader();
                       ^~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:22187:40: warning: the variable "FormData" was not declared in anonymous function
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
                                       ^~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:22189:44: warning: the variable "URLSearchParams" was not declared in anonymous function
...e if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body...
                                 ^~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:22442:23: warning: the variable "XMLHttpRequest" was not declared in anonymous function
        var xhr = new XMLHttpRequest();
                      ^~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:59809:9: warning: the variable "cancelAnimationFrame" was not declared in anonymous arrow function
        cancelAnimationFrame(rafHandle);
        ^~~~~~~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:64509:125: warning: the variable "location" was not declared in function "registerSensor"
...IRE(_dependencyMap[7]).IS_WEB && location.protocol !== 'https:' ? ' Make s...
                                    ^~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:64587:25: warning: the variable "navigator" was not declared in function "detectPlatform"
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                        ^~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:84095:27: warning: the variable "HTMLElement" was not declared in function "findDescendantWithExitingAnimation"
    if (!(node instanceof HTMLElement)) {
                          ^~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:84121:24: warning: the variable "MutationObserver" was not declared in function "addHTMLMutationObserver"
    var observer = new MutationObserver(mutationsList => {
                       ^~~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:86374:41: warning: the variable "getComputedStyle" was not declared in function "fixElementPosition"
...entBorderTopValue = parseInt(getComputedStyle(parent).borderTopWidth);
                                ^~~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:86806:26: warning: the variable "structuredClone" was not declared in function "createAnimationWithInitialValues"
    var animationStyle = structuredClone(_$$_REQUIRE(_dependencyMap[5]).Anima...
                         ^~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:89309:25: warning: the variable "setInterval" was not declared in anonymous function
      this.intervalId = setInterval(this.syncPropsBackToReact.bind(this), FLU...
                        ^~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:89313:9: warning: the variable "clearInterval" was not declared in anonymous function
        clearInterval(this.intervalId);
        ^~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:92615:5: warning: the variable "jest" was not declared in anonymous arrow function
    jest.useFakeTimers();
    ^~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:112847:9: warning: the variable "REACT_NAVIGATION_DEVTOOLS" was not declared in anonymous arrow function
        REACT_NAVIGATION_DEVTOOLS.set(refContainer.current, {
        ^~~~~~~~~~~~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:117454:16: warning: the variable "requestIdleCallback" was not declared in anonymous arrow function
      var id = requestIdleCallback(() => {
               ^~~~~~~~~~~~~~~~~~~
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/main.jsbundle:117457:20: warning: the variable "cancelIdleCallback" was not declared in anonymous arrow function
      return () => cancelIdleCallback(id);
                   ^~~~~~~~~~~~~~~~~~
+ [[ '' == true ]]
+ BUNDLE_FILE=/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app/main.jsbundle
+ [[ false != true ]]
+ [[ ! -f /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app/main.jsbundle ]]
```

<p style="color:#008000;"><strong>What this block does:</strong> Metro writes the JavaScript bundle, copies 34 application assets, and reports completion. Hermes then compiles that bundle into optimized bytecode and writes the final <code>main.jsbundle</code inside <code>MovieApp.app</code>. The final file-existence test completes without an error, which means the expected Hermes bundle was present.</p>

<p style="color:#008000;"><strong>Why 22 warnings appear:</strong> Hermes statically sees names that are supplied by React Native, Hermes, a browser compatibility layer, or development tooling at runtime instead of being declared in the same generated JavaScript file. The warnings cover runtime primitives such as <code>Promise</code>, <code>setImmediate</code>, timers, and frame callbacks; data and networking APIs such as <code>Blob</code>, <code>FileReader</code>, <code>FormData</code>, <code>URLSearchParams</code>, and <code>XMLHttpRequest</code>; browser-oriented names such as <code>location</code>, <code>navigator</code>, <code>HTMLElement</code>, <code>MutationObserver</code>, and <code>getComputedStyle</code>; and development or library hooks such as <code>jest</code> and <code>REACT_NAVIGATION_DEVTOOLS</code>. Hermes reports all 22 occurrences, but none is classified as an error and compilation continues successfully.</p>

<p style="color:#008000;"><strong>Practical conclusion:</strong> These warnings are worth monitoring after dependency upgrades, but this transcript does not show any of them breaking the Release bundle. They are not the missing-dSYM problem.</p>

<p style="color:#008000;"><strong>Metaphor:</strong> Hermes is a proofreader who notices references to terms defined in companion books. The proofreader flags the references because their definitions are not printed on the same page, but the complete library still contains them when the app runs.</p>

<br><br>

<h2 style="color:#008000;">Source paragraphs 5–18 — Copy and sign 13 embedded frameworks</h2>
```text
PhaseScriptExecution [CP]\ Embed\ Pods\ Frameworks /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Script-00EEFC60759A1932668264C0.sh (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /bin/sh -c /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Script-00EEFC60759A1932668264C0.sh
mkdir -p /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app/Frameworks
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignal/OneSignalFramework.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalFramework.framework/
OneSignalFramework.framework/Info.plist
OneSignalFramework.framework/OneSignalFramework
OneSignalFramework.framework/PrivacyInfo.xcprivacy
OneSignalFramework.framework/_CodeSignature/
OneSignalFramework.framework/_CodeSignature/CodeResources

sent 221012 bytes  received 120 bytes  71332903 bytes/sec
total size is 220218  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalFramework.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalFramework.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalFramework.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalCore/OneSignalCore.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalCore.framework/
OneSignalCore.framework/Info.plist
OneSignalCore.framework/OneSignalCore
OneSignalCore.framework/PrivacyInfo.xcprivacy
OneSignalCore.framework/_CodeSignature/
OneSignalCore.framework/_CodeSignature/CodeResources

sent 220492 bytes  received 120 bytes  53807804 bytes/sec
total size is 219733  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalCore.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalCore.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalCore.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalExtension/OneSignalExtension.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalExtension.framework/
OneSignalExtension.framework/Info.plist
OneSignalExtension.framework/OneSignalExtension
OneSignalExtension.framework/PrivacyInfo.xcprivacy
OneSignalExtension.framework/_CodeSignature/
OneSignalExtension.framework/_CodeSignature/CodeResources

sent 134621 bytes  received 120 bytes  43464838 bytes/sec
total size is 133839  speedup is 0.99
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalExtension.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalExtension.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalExtension.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalInAppMessages/OneSignalInAppMessages.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalInAppMessages.framework/
OneSignalInAppMessages.framework/Info.plist
OneSignalInAppMessages.framework/OneSignalInAppMessages
OneSignalInAppMessages.framework/PrivacyInfo.xcprivacy
OneSignalInAppMessages.framework/_CodeSignature/
OneSignalInAppMessages.framework/_CodeSignature/CodeResources

sent 387730 bytes  received 120 bytes  94597560 bytes/sec
total size is 386888  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalInAppMessages.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalInAppMessages.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalInAppMessages.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalLiveActivities/OneSignalLiveActivities.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalLiveActivities.framework/
OneSignalLiveActivities.framework/Info.plist
OneSignalLiveActivities.framework/OneSignalLiveActivities
OneSignalLiveActivities.framework/PrivacyInfo.xcprivacy
OneSignalLiveActivities.framework/_CodeSignature/
OneSignalLiveActivities.framework/_CodeSignature/CodeResources

sent 345167 bytes  received 120 bytes  111382903 bytes/sec
total size is 344322  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalLiveActivities.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalLiveActivities.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalLiveActivities.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalLocation/OneSignalLocation.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalLocation.framework/
OneSignalLocation.framework/Info.plist
OneSignalLocation.framework/OneSignalLocation
OneSignalLocation.framework/PrivacyInfo.xcprivacy
OneSignalLocation.framework/_CodeSignature/
OneSignalLocation.framework/_CodeSignature/CodeResources

sent 85245 bytes  received 120 bytes  40649999 bytes/sec
total size is 84474  speedup is 0.99
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalLocation.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalLocation.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalLocation.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalNotifications/OneSignalNotifications.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalNotifications.framework/
OneSignalNotifications.framework/Info.plist
OneSignalNotifications.framework/OneSignalNotifications
OneSignalNotifications.framework/PrivacyInfo.xcprivacy
OneSignalNotifications.framework/_CodeSignature/
OneSignalNotifications.framework/_CodeSignature/CodeResources

sent 190816 bytes  received 120 bytes  61592258 bytes/sec
total size is 189998  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalNotifications.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalNotifications.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalNotifications.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalOSCore/OneSignalOSCore.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalOSCore.framework/
OneSignalOSCore.framework/Info.plist
OneSignalOSCore.framework/OneSignalOSCore
OneSignalOSCore.framework/PrivacyInfo.xcprivacy
OneSignalOSCore.framework/_CodeSignature/
OneSignalOSCore.framework/_CodeSignature/CodeResources

sent 246037 bytes  received 120 bytes  79405483 bytes/sec
total size is 245260  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalOSCore.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalOSCore.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalOSCore.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalOutcomes/OneSignalOutcomes.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalOutcomes.framework/
OneSignalOutcomes.framework/Info.plist
OneSignalOutcomes.framework/OneSignalOutcomes
OneSignalOutcomes.framework/PrivacyInfo.xcprivacy
OneSignalOutcomes.framework/_CodeSignature/
OneSignalOutcomes.framework/_CodeSignature/CodeResources

sent 212180 bytes  received 120 bytes  68483870 bytes/sec
total size is 211393  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalOutcomes.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalOutcomes.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalOutcomes.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/OneSignalXCFramework/OneSignalUser/OneSignalUser.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 6 files
OneSignalUser.framework/
OneSignalUser.framework/Info.plist
OneSignalUser.framework/OneSignalUser
OneSignalUser.framework/PrivacyInfo.xcprivacy
OneSignalUser.framework/_CodeSignature/
OneSignalUser.framework/_CodeSignature/CodeResources

sent 518311 bytes  received 120 bytes  126446585 bytes/sec
total size is 517516  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalUser.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalUser.framework'
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/OneSignalUser.framework: replacing existing signature
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/React-Core-prebuilt/React.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 3 files
React.framework/
React.framework/Info.plist
React.framework/React

sent 10644627 bytes  received 70 bytes  212469001 bytes/sec
total size is 10642936  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/React.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/React.framework'
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/ReactNativeDependencies/ReactNativeDependencies.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 12 files
ReactNativeDependencies.framework/
ReactNativeDependencies.framework/Info.plist
ReactNativeDependencies.framework/ReactNativeDependencies
ReactNativeDependencies.framework/ReactNativeDependencies_boost.bundle/
ReactNativeDependencies.framework/ReactNativeDependencies_boost.bundle/Info.plist
ReactNativeDependencies.framework/ReactNativeDependencies_boost.bundle/PrivacyInfo.xcprivacy
ReactNativeDependencies.framework/ReactNativeDependencies_folly.bundle/
ReactNativeDependencies.framework/ReactNativeDependencies_folly.bundle/Info.plist
ReactNativeDependencies.framework/ReactNativeDependencies_folly.bundle/PrivacyInfo.xcprivacy
ReactNativeDependencies.framework/ReactNativeDependencies_glog.bundle/
ReactNativeDependencies.framework/ReactNativeDependencies_glog.bundle/Info.plist
ReactNativeDependencies.framework/ReactNativeDependencies_glog.bundle/PrivacyInfo.xcprivacy

sent 1263390 bytes  received 220 bytes  156001234 bytes/sec
total size is 1261526  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/ReactNativeDependencies.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/ReactNativeDependencies.framework'
rsync --delete -av --filter P .*.?????? --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" --filter "- Headers" --filter "- PrivateHeaders" --filter "- Modules" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/XCFrameworkIntermediates/hermes-engine/Pre-built/hermesvm.framework" "/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks"
Transfer starting: 3 files
hermesvm.framework/
hermesvm.framework/Info.plist
hermesvm.framework/hermesvm

sent 5933566 bytes  received 70 bytes  190792154 bytes/sec
total size is 5932435  speedup is 1.00
Code Signing /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/hermesvm.framework with Identity Apple Development: William Roncallo (3S478T3R39)
/usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A  --preserve-metadata=identifier,entitlements '/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks/hermesvm.framework'
```

<p style="color:#008000;"><strong>What these 14 transcript paragraphs do:</strong> CocoaPods creates <code>MovieApp.app/Frameworks</code>, then repeats the same copy-and-sign workflow for 13 frameworks. The ten OneSignal frameworks are OneSignalFramework, OneSignalCore, OneSignalExtension, OneSignalInAppMessages, OneSignalLiveActivities, OneSignalLocation, OneSignalNotifications, OneSignalOSCore, OneSignalOutcomes, and OneSignalUser. The three React Native frameworks are React, ReactNativeDependencies, and hermesvm.</p>

<p style="color:#008000;"><strong>What each repeated framework operation means:</strong> <code>rsync</code> copies the framework while excluding development-only folders such as Headers, PrivateHeaders, Modules, and source-control metadata. The <code>sent</code>, <code>received</code>, <code>total size</code>, and <code>speedup</code> lines are transfer statistics. Xcode then signs the copied framework with the selected Apple identity so iOS will accept the code as part of the signed app. The OneSignal message <code>replacing existing signature</code> means Xcode intentionally replaced the vendor's existing signature with the signature required for this app archive.</p>

<p style="color:#008000;"><strong>Important dSYM distinction:</strong> These blocks copy executable framework binaries. They do not copy the matching framework dSYM bundles. Therefore, successful framework copying and signing does not prove that React.framework.dSYM, ReactNativeDependencies.framework.dSYM, or hermesvm.framework.dSYM is present in the archive. That is why the separate archive-validation task is still required.</p>

<p style="color:#008000;"><strong>Metaphor:</strong> Thirteen sealed equipment crates are loaded into the app. Xcode removes packing material that customers do not need and stamps every crate with MovieApp's security seal. The dSYM files are separate inventory maps; loading the crates does not automatically load those maps.</p>

<br><br>

<h2 style="color:#008000;">Source paragraphs 19–21 — Copy CocoaPods resources</h2>
```text
PhaseScriptExecution [CP]\ Copy\ Pods\ Resources /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Script-E235C05ADACE081382539298.sh (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /bin/sh -c /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Script-E235C05ADACE081382539298.sh
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/AsyncStorage/AsyncStorage_resources.bundle
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/React-Core/React-Core_privacy.bundle
/Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/React-cxxreact/React-cxxreact_privacy.bundle
/Users/croncallo/repo/MovieApp/ios/Pods/../../node_modules/@react-native-vector-icons/ionicons/fonts/Ionicons.ttf
Transfer starting: 10 files
Ionicons.ttf
AsyncStorage_resources.bundle/
AsyncStorage_resources.bundle/Info.plist
AsyncStorage_resources.bundle/PrivacyInfo.xcprivacy
React-Core_privacy.bundle/
React-Core_privacy.bundle/Info.plist
React-Core_privacy.bundle/PrivacyInfo.xcprivacy
React-cxxreact_privacy.bundle/
React-cxxreact_privacy.bundle/Info.plist
React-cxxreact_privacy.bundle/PrivacyInfo.xcprivacy

sent 395108 bytes  received 192 bytes  77509803 bytes/sec
total size is 394061  speedup is 1.00
Transfer starting: 10 files

sent 663 bytes  received 20 bytes  620909 bytes/sec
total size is 394061  speedup is 576.96
```

<p style="color:#008000;"><strong>What these three transcript paragraphs do:</strong> CocoaPods copies non-executable resources into the app: the AsyncStorage resource bundle, React Core and React C++ privacy bundles, and the Ionicons font. The first transfer lists the ten files and directories copied. The short second transfer is another synchronization pass over the same ten-file set; it sends only a small amount of transfer metadata because the material is already synchronized.</p>

<p style="color:#008000;"><strong>Why this matters:</strong> The privacy manifests tell Apple which required-reason APIs bundled libraries declare, and <code>Ionicons.ttf</code> supplies icons used by the interface. No error is reported.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 22 — Embed the OneSignal notification extension</h2>
```text
Copy /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/PlugIns/OneSignalNotificationServiceExtension.appex /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/OneSignalNotificationServiceExtension.appex (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -strip-unsigned-binaries -strip-deterministic -strip-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/strip -resolve-src-symlinks -remove-static-executable /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/OneSignalNotificationServiceExtension.appex /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/PlugIns
warning: not stripping binary because it is signed: /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/UninstalledProducts/iphoneos/OneSignalNotificationServiceExtension.appex/OneSignalNotificationServiceExtension (in target 'MovieApp' from project 'MovieApp')
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode copies <code>OneSignalNotificationServiceExtension.appex</code> into MovieApp's <code>PlugIns</code> folder. That extension runs separately when iOS processes eligible push notifications.</p>

<p style="color:#008000;"><strong>Meaning of the stripping warning:</strong> Xcode considered removing unneeded symbols from the extension binary but found that the binary was already signed, so it did not alter it. The copy still completed. This warning is informational in this archive and is unrelated to missing dSYM bundles.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 23 — Build the final application Info.plist</h2>
```text
ProcessInfoPlistFile /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Info.plist /Users/croncallo/repo/MovieApp/ios/MovieApp/Info.plist (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    builtin-infoPlistUtility /Users/croncallo/repo/MovieApp/ios/MovieApp/Info.plist -producttype com.apple.product-type.application -genpkginfo /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -additionalcontentfile /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/LaunchScreen-SBPartialInfo.plist -additionalcontentfile /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/assetcatalog_generated_info.plist -scanforprivacyfile /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/PlugIns/OneSignalNotificationServiceExtension.appex -requiredArchitecture arm64 -o /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Info.plist
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode reads <code>ios/MovieApp/Info.plist</code>, expands build-setting placeholders, merges generated launch-screen and asset-catalog information, scans the embedded OneSignal extension for privacy information, requires the arm64 architecture, and writes the finished binary-format <code>Info.plist</code> into <code>MovieApp.app</code>. This finished file is the metadata Apple and iOS read from the archived app.</p>

<p style="color:#008000;"><strong>Metaphor:</strong> The source Info.plist is a form template. Xcode fills in the project-specific blanks, attaches required addenda, and places the completed form inside the shipment.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 24 — Check for App Intents metadata</h2>
```text
ExtractAppIntentsMetadata (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name MovieApp --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.5.sdk --xcode-version 17F42 --platform-family iOS --deployment-target 15.1 --bundle-identifier com.codefest.movieapp --output /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app --target-triple arm64-apple-ios15.1 --binary-file /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/MovieApp --dependency-file /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/arm64/MovieApp_dependency_info.dat --stringsdata-file /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/arm64/MovieApp.SwiftFileList --metadata-file-list /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/MovieApp.DependencyMetadataFileList --static-metadata-file-list /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/MovieApp.DependencyStaticMetadataFileList --swift-const-vals-list /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/Objects-normal/arm64/MovieApp.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-06-26 17:08:46.771 appintentsmetadataprocessor[39328:320931] Starting appintentsmetadataprocessor export
2026-06-26 17:08:46.774 appintentsmetadataprocessor[39328:320931] warning: Metadata extraction skipped. No AppIntents.framework dependency found.
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode checks whether MovieApp declares App Intents, App Shortcuts, or Siri-style actions that require extracted metadata. It finds no dependency on <code>AppIntents.framework</code>, so it skips extraction.</p>

<p style="color:#008000;"><strong>Meaning of the warning:</strong> MovieApp does not currently use this Apple feature. Skipping unused App Intents metadata is harmless and does not prevent archiving or App Store submission.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 25 — Copy required Swift runtime libraries</h2>
```text
CopySwiftLibs /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    builtin-swiftStdLibTool --copy --verbose --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A --scan-executable /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/MovieApp --scan-folder /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks --scan-folder /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/PlugIns --scan-folder /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/SystemExtensions --scan-folder /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Frameworks --unsigned-destination /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/SwiftSupport --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os --back-deploy-swift-span
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode scans the main MovieApp executable, embedded frameworks, plug-ins, and extension locations to determine which Swift runtime libraries the archive needs. It copies only the required libraries into the app's Frameworks folder, prepares SwiftSupport content for distribution, strips obsolete bitcode where necessary, and signs copied libraries with the same identity.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 26 — Generate MovieApp’s own dSYM</h2>
```text
GenerateDSYMFile /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app.dSYM /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/MovieApp (in target'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/dsymutil /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/MovieApp -o /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/BuildProductsPath/Release-iphoneos/MovieApp.app.dSYM
```

<p style="color:#008000;"><strong>What this block does:</strong> <code>dsymutil</code> reads the main <code>MovieApp</code> executable and creates <code>MovieApp.app.dSYM</code>. That dSYM lets crash-reporting systems translate raw MovieApp instruction addresses into readable function and source information.</p>

<p style="color:#008000;"><strong>Critical limitation:</strong> This command generates a dSYM only for the main MovieApp executable. It does not generate dSYMs for the already-compiled React, ReactNativeDependencies, or hermesvm frameworks. Their dSYMs must match the exact precompiled framework UUIDs and must come from the producer of those binaries or from matching published artifacts.</p>

<p style="color:#008000;"><strong>Metaphor:</strong> Xcode prints a street map for the city it just built—the MovieApp executable. It cannot invent accurate maps for three neighboring cities that arrived already built; those maps must come from the builders of those cities.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 27 — Check for App Shortcuts training data</h2>
```text
AppIntentsSSUTraining (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsnltrainingprocessor --infoplist-path /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Info.plist --temp-dir-path /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/ssu --bundle-id com.codefest.movieapp --product-path /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app --extracted-metadata-path /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Metadata.appintents --deployment-postprocessing --metadata-file-list /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/MovieApp.DependencyMetadataFileList --source-file /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Info.plist --archive-ssu-assets
2026-06-26 17:08:46.791 appintentsnltrainingprocessor[39330:320933] Parsing options for appintentsnltrainingprocessor
2026-06-26 17:08:46.791 appintentsnltrainingprocessor[39330:320933] Starting AppIntents SSU YAML Generation
2026-06-26 17:08:46.791 appintentsnltrainingprocessor[39330:320933] No AppShortcuts found - Skipping.
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode checks the completed Info.plist and extracted metadata for App Shortcuts language-training data. It finds no App Shortcuts and skips the optional generation step. This is expected for an app that does not define App Shortcuts.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 28 — Strip the release executable</h2>
```text
Strip /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/MovieApp(in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/strip -D /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/MovieApp
```

<p style="color:#008000;"><strong>What this block does:</strong> After creating MovieApp.app.dSYM, Xcode strips unnecessary symbol information from the copy of the MovieApp executable that will ship. This reduces the delivered binary while the separate dSYM retains the debugging map needed for readable crash reports.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 29 — Set archive ownership</h2>
```text
SetOwnerAndGroup croncallo:staff /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /usr/sbin/chown -RH croncallo:staff /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode sets the locally archived app bundle's owner to the current macOS account, <code>croncallo</code>, and its group to <code>staff</code>. This controls local file ownership inside the build workspace; it does not create an App Store account or customer-facing permission.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 30 — Set archive file permissions</h2>
```text
SetMode u+w,go-w,a+rX /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /bin/chmod -RH u+w,go-w,a+rX /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode applies standard bundle permissions: the owner may write, group and others may not write, and everyone receives normal read and directory-traversal access. This produces a consistently readable, non-world-writable app bundle before signing.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 31 — Sign MovieApp.app</h2>
```text
CodeSign /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    
    Signing Identity:     "Apple Development: William Roncallo (3S478T3R39)"
    Provisioning Profile: "iOS Team Provisioning Profile: com.codefest.movieapp"
                          (c96b762f-4e54-453a-9863-f5f04d06b2c5)
    
    /usr/bin/codesign --force --sign A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A --entitlements /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/IntermediateBuildFilesPath/MovieApp.build/Release-iphoneos/MovieApp.build/MovieApp.app.xcent --generate-entitlement-der /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode signs the completed MovieApp bundle with the displayed Apple Development identity, provisioning profile, and generated entitlements. The signature cryptographically binds the executable and bundle contents so later modification can be detected. During App Store distribution, Xcode's export/upload process can re-sign the archived content with the distribution credentials selected for that operation.</p>

<p style="color:#008000;"><strong>Metaphor:</strong> This is the tamper-evident seal placed around the finished package. If contents covered by the seal change afterward, the package must be signed again before a device will trust it.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 32 — Validate the embedded OneSignal extension</h2>
```text
ValidateEmbeddedBinary /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/PlugIns/OneSignalNotificationServiceExtension.appex (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /Applications/Xcode.app/Contents/Developer/usr/bin/embeddedBinaryValidationUtility /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/PlugIns/OneSignalNotificationServiceExtension.appex -signing-cert A1D8F1A0D9C05FC5D0ED9587D7C7E481F0625B8A -info-plist-path /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app/Info.plist
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode verifies that the embedded OneSignal notification extension is compatible with the containing MovieApp bundle, uses the expected signing certificate, and is represented correctly by the containing app's Info.plist. No validation failure is reported.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 33 — Register an execution-policy exception</h2>
```text
RegisterExecutionPolicyException /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    builtin-RegisterExecutionPolicyException /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode registers the just-built local app bundle with macOS's build execution policy machinery so later Xcode processing can handle the generated product. This is an internal build-system bookkeeping step, not an app entitlement and not a request to weaken security on customer devices.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 34 — Run Xcode’s local App Store validation</h2>
```text
Validate /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    builtin-validationUtility /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app -validate-for-store -shallow-bundle -infoplist-subpath Info.plist
```

<p style="color:#008000;"><strong>What this block does:</strong> Xcode runs its local validation utility with <code>-validate-for-store</code>. It checks the shallow application bundle and its Info.plist for structural problems that Xcode knows how to detect at archive time.</p>

<p style="color:#008000;"><strong>Important boundary:</strong> This is not the same as App Store Connect's server-side upload validation. Apple's servers can perform additional checks—such as comparing every embedded executable UUID with uploaded dSYMs—after distribution begins.</p>

<p style="color:#008000;"><strong>Metaphor:</strong> This is the sender's pre-shipping checklist. Passing it means the box looks valid before pickup; the carrier's depot still performs its own inspection.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 35 — Finalize the app bundle timestamp</h2>
```text
Touch /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app (in target 'MovieApp' from project 'MovieApp')
    cd /Users/croncallo/repo/MovieApp/ios
    /usr/bin/touch -c /Users/croncallo/Library/Developer/Xcode/DerivedData/MovieApp-dqgauysuablgfqfjtuzkbdfnmmxb/Build/Intermediates.noindex/ArchiveIntermediates/MovieApp/InstallationBuildProductsLocation/Applications/MovieApp.app
```

<p style="color:#008000;"><strong>What this block does:</strong> <code>touch -c</code> updates the existing MovieApp.app bundle timestamp without creating anything new. It marks the product as freshly completed for the build system.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 36 — Build-phase notices and final success</h2>
```text
warning: Run script build phase '[CP-User] [Hermes] Replace Hermes for the right configuration, if needed' will be run during every build because it does not specify any outputs. To address this issue, either add output dependencies to the script phase, or configure it to run in every build by unchecking "Based on dependency analysis" in the script phase. (in target 'hermes-engine' from project 'Pods')
note: Run script build phase '[CP-User] [RNDeps] Replace React Native Dependencies for the right configuration, if needed' will be run during every build because the option to run the script phase "Based on dependency analysis" is unchecked. (in target 'ReactNativeDependencies' from project 'Pods')
note: Run script build phase '[CP-User] [RN]Check FBReactNativeSpec' will be run during every build because the option to run the script phase "Based on dependency analysis" is unchecked. (in target 'React-RCTFBReactNativeSpec' from project 'Pods')
note: Run script build phase '[CP-User] [RNDeps] Replace React Native Core for the right configuration, if needed' will be run during every build because the option to run the script phase "Based on dependency analysis" is unchecked. (in target 'React-Core-prebuilt' from project 'Pods')
warning: Run script build phase 'Bundle React Native code and images' will be run during every build because it does not specify any outputs. To address this issue, either add output dependencies to the script phase, or configure it to run in every build by unchecking "Based on dependency analysis" in the script phase. (in target 'MovieApp' from project 'MovieApp')
** ARCHIVE SUCCEEDED **
```

<p style="color:#008000;"><strong>What the two warnings mean:</strong> The Hermes replacement script and the React Native bundle script do not declare output files that Xcode can use for dependency analysis, so Xcode plans to run them during every build. This can make builds slower, but it does not make the archive invalid.</p>

<p style="color:#008000;"><strong>What the three notes mean:</strong> Three CocoaPods/React Native scripts are explicitly configured to run every build because dependency-based skipping is disabled. Again, this concerns build scheduling and performance, not application correctness.</p>

<p style="color:#008000;"><strong>Final result:</strong> <code>** ARCHIVE SUCCEEDED **</code> is the decisive archive result. No <code>error:</code> line appears in the supplied transcript. Across the complete supplied output there are 26 warning records: 22 Hermes global-name warnings, the signed-extension stripping warning, the unused App Intents metadata warning, and the two run-script scheduling warnings. There are also three run-script scheduling notes.</p>

<p style="color:#008000;"><strong>What success does not prove:</strong> Archive success proves that Xcode built and packaged the app. It does not prove that App Store Connect will accept every optional diagnostic artifact. The separate iOS archive validation still needs to confirm and, when necessary, copy the matching framework dSYMs before upload.</p>

<br><br>

<h2 style="color:#008000;">Source paragraph 37 — Shell prompt returns</h2>
```text
croncallo@Carlos-MacBook-Pro MovieApp % 
```

<p style="color:#008000;"><strong>What this block does:</strong> The shell prompt returned to <code>/Users/croncallo/repo/MovieApp</code>. That confirms the archive command finished and released control back to the terminal instead of remaining stuck in a background build step.</p>

<br><br>
