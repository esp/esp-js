#!/bin/bash

CMD=$1
shift

exe() { echo "$@" ; $@ ; }

case $CMD in
  clean)
    exe "rm -rf ./.dist && rm -rf ./.tsbuild"
    ;;

  build-dev)
    export NODE_ENV=dev
    exe "$(pwd)/node_modules/.bin/webpack --display-reasons --display-error-details"
    ;;

  build-prod)
    export NODE_ENV=prod
    exe "./node_modules/.bin/webpack --display-reasons --display-error-details"
    ;;

  test)
    exe "./node_modules/.bin/jest --watchAll --verbose --no-cache -c $(pwd)/jest.config.js --rootDir ."
    ;;

  test-ci)
    exe "./node_modules/.bin/jest --verbose --no-cache -c $(pwd)/jest.config.js --rootDir ."
    ;;

  start)
    exe "./node_modules/.bin/webpack-dev-server --inline --watch --progress --colors"
    ;;

  *)
    if [[ -z "$CMD" ]]; then
      echo "USAGE: ./task (clean|build-dev|<node_modules_bin_command>) command_args"
      exit 0
    fi
    exe "../../node_modules/.bin/$CMD $@"
    ;;
esac