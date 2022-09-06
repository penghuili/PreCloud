#!/bin/bash
      # Helper script for Gradle to call npm on macOS in case it is not found
      export PATH=$PATH:/Users/peng/.nvm/versions/node/v14.17.4/lib/node_modules/npm/node_modules/npm-lifecycle/node-gyp-bin:/Users/peng/peng/PreCloud/node_modules/nodejs-mobile-react-native/node_modules/.bin:/Users/peng/peng/PreCloud/node_modules/.bin:/Users/peng/.rvm/gems/ruby-2.7.4/bin:/Users/peng/.rvm/gems/ruby-2.7.4@global/bin:/Users/peng/.rvm/rubies/ruby-2.7.4/bin:/Users/peng/.rvm/bin:/Users/peng/.nvm/versions/node/v14.17.4/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/munki:/Library/Apple/usr/bin
      npm $@
    