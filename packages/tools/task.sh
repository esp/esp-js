#!/bin/bash

CMD=$1
shift

TEST_CI_COMMAND="test -f $(pwd)/jest.config.js && ./node_modules/.bin/jest --verbose --no-cache -c $(pwd)/jest.config.js --rootDir . || echo \"Skipping tests no test config found\""

case $CMD in
  clean)
    eval "rm -rf ./.dist && rm -rf ./.tsbuild"
    ;;

  build-dev)
    export NODE_ENV=dev
    eval "$(pwd)/node_modules/.bin/webpack --display-reasons --display-error-details && ${TEST_CI_COMMAND}"
    ;;

  build-prod)
    export NODE_ENV=prod
    eval "./node_modules/.bin/webpack --display-reasons --display-error-details && ${TEST_CI_COMMAND}"
    ;;

  test)
    eval "${TEST_CI_COMMAND} --watchAll"
    ;;

  test-ci)
    eval "${TEST_CI_COMMAND}"
    ;;

  start)
    eval "./node_modules/.bin/webpack-dev-server --inline --watch --progress --colors"
    ;;

  *)
    if [[ -z "$CMD" ]]; then
      echo "USAGE: ./task (clean|build-dev|<node_modules_bin_command>) command_args"
      exit 0
    fi
    exe "../../node_modules/.bin/$CMD $@"
    ;;
esac