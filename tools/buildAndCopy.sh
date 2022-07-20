#!/usr/bin/env bash
TARGET_PATH=$1

echo $TARGET_PATH;

grunt
cp dist $TARGET_PATH -r -T
