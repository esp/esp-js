#!/usr/bin/env bash
protoc  --proto_path=./ --js_out=import_style=commonjs,binary:./ test-message.proto
