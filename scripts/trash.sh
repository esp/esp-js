#!/usr/bin/env bash
find ./ -name yarn-error.log -delete -print
find ./ -name lerna-debug.log -delete -print
find ./ -name npm-debug.log -delete -print
find ./ -name *.orig -delete -print
find ./ -name yarn.lock -delete -print