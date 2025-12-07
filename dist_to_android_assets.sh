#!/bin/bash
npm run build
mkdir -p android/app/src/main/assets/tap-practice
rm -fr android/app/src/main/assets/tap-practice/*
cp -r dist/* android/app/src/main/assets/tap-practice/
