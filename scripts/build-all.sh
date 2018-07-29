#!/usr/bin/env bash
# Using an sh script for this as there is a required ordering between the packages and
# I don't see how to do that via lerna (seems not supported)

set -e
green=`tput setaf 2`
reset=`tput sgr0`

ENVIRONMENT=$1

log () {
    echo "${green}>>>>>>>>> $1${reset}"
}

build () {
    log "Building $1"
    lerna run build-${ENVIRONMENT} --scope $1 --stream
}

test () {
    log "Testing $1"
    lerna run test-ci --scope $1 --stream
}


export NODE_ENV=$1

log "Cleaning"
lerna run clean

build esp-js
test esp-js

build esp-js-react
test esp-js-ui

build esp-js-ui
test esp-js-ui

# build esp-js-api // no build-dev target
# build esp-js-chat-react-es6 // haven't migrated build-dev yet
build esp-js-react-agile-board
# build esp-js-todomvc-react // no build-dev target
build esp-js-ui-module-based-app