#!/usr/bin/env bash
TARGET_PATH=$1

echo $TARGET_PATH;

npm run build
cp dist $TARGET_PATH -r -T
