#!/usr/bin/env bash
# Using an sh script for this as there is a required ordering between the packages and
# I don't see how to do that via lerna (seems not supported)

set -e
green=`tput setaf 2`
reset=`tput sgr0`

log () {
    echo "${green}>>>>>>>>> $1${reset}"
}

build-and-test () {
    log "Building $1"
    lerna run build-$ENVIRONMENT --scope $1 --stream
    log "Testing $1"
    lerna run test-ci --scope $1 --stream
}

ENVIRONMENT=$1

export NODE_ENV=$1

log "Cleaning$"
lerna run clean

build-and-test esp-js
build-and-test esp-js-react
build-and-test esp-js-ui

#
# lerna run build-$ENVIRONMENT -- --scope esp-js-ui --stream
# lerna run test-ci --scope esp-js-ui
#
# lerna run build-$ENVIRONMENT --scope esp-js-api --stream
# lerna run build-$ENVIRONMENT --scope esp-js-chat-react-es6 --stream
# lerna run build-$ENVIRONMENT --scope esp-js-react-agile-board --stream
# lerna run build-$ENVIRONMENT --scope esp-js-todomvc-react --stream
# lerna run build-$ENVIRONMENT --scope esp-js-ui-module-based-app --stream