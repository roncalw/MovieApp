OS:         Ventura 13.5.2
Node:       
    node --version
        v18.17.1

NPM:        
    npm --version
        9.6.7

CocoaPods:
    gem which cocoapods
        /Users/croncallo/.rbenv/versions/2.7.6/lib/ruby/gems/2.7.0/gems/cocoapods-1.12.1/lib/cocoapods.rb

    pod --version
        1.12.1

Ruby:
    ruby --version
        ruby 2.7.6p219 (2022-04-12 revision c9c2245c0a) [arm64-darwin22]

Xcode:
    xcodebuild -version
        Xcode 14.3.1
        Build version 14E300c

        https://en.wikipedia.org/wiki/Xcode - Xcode Version table to see date of your Xcode version
        6/1/2023

Xcode Command Line Tools:
    softwareupdate --history
        Display Name                                       Version    Date                  
        ------------                                       -------    ----                  
        macOS Ventura 13.5.1                               13.5.1     09/02/2023, 13:37:52  
        Command Line Tools for Xcode                       14.3       09/02/2023, 14:22:28  
        macOS Ventura 13.5.2                               13.5.2     09/09/2023, 17:01:19 


        You cannot check the version number of Xcode Command Line Tools directly, but you can do so indirectly by checking the version of the Clang compiler in Terminal:
        clang --version
            Apple clang version 14.0.3 (clang-1403.0.22.14.1) -- Look this up in the table at https://en.wikipedia.org/wiki/Xcode
            Target: arm64-apple-darwin22.6.0
            Thread model: posix
            InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin

        To switch Commandline Tools for Xcode versions, you have to
            * Make directories for each version you want
                - Eg.
                    $ mkdir ~/Project/tools
                    $ mkdir ~/Projects/tools/Developer10.5.1
                    $ mkdir ~/Projects/tools/Developer9.4.1
            * Install whatever version you want of the Command Line Tool for Xcode
                - Because it will ONLY install to /Library/Developer, you then copy from /Library/Developer to the folder you made above for the version you just installed
                -Eg.
                    cp -R /Library/Developer/ ~/Project/tools/Developer9.4.1/
            * Repeat the install process for each version installed
            * Then use xcode-select to switch between the different versions
                -Eg
                    -- xcode-select -s ~/Project/tools/Developer9.4.1/
                    -- Verify
                        --- clang --version
                            Apple LLVM version 9.1.0 (clang-902.0.39.2)
                            Target: x86_64-apple-darwin17.7.0
                            Thread model: posix
                            InstalledDir: /Users/<username>/Projects/tools/Developer9.4.1/CommandLineTools/usr/bin

Xcode Location:
    xcode-select -p
        /Applications/Xcode.app/Contents/Developer

    To switch xcode Versions (assuming you have other versions in your app folder)
        Eg.
            sudo xcode-select -s /Applications/Xcode_12.4.app # Makes Xcode 12.4 you default Xcode
            sudo xcode-select -s /Applications/Xcode-13.4.1.app # Makes Xcode 13.4.1 you default Xcode
    Run the xcode-select -p command again to confirm it is pointing to the default

    

NOTE:
    To get an app from work, to work, that was on React Native 61.2

Node
    v14.18.1
    
NPM
    6.14.15

Xcode
    13.4.1.app