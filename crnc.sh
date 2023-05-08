#!/bin/zsh
echo "Running the watchman watch-del-all command"
watchman watch-del-all
echo "Running the Remove Recursive Node Modules folder command"
rm -rf node_modules/
echo "Running the NPM Cache Clean with Force command"
npm cache clean -force
echo "Running the NPM Install command"
npm install
echo "Running the NPM Start Metro with Reset Cache command"
npm start -- --reset-cache

