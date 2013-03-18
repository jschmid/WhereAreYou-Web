#!/bin/bash

set -e

git checkout master

rm -rf build
mkdir build
cd build
mkdir files
cd ..
cp 404.css build/files/
cp 404.html build/files/
cp icon.png build/files/
cp close.png build/files/
cp index.html build/files/
coffee -o build/files -c 404.coffee index.coffee
