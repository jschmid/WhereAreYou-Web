#!/bin/bash

set -e

git checkout master

rm -rf build
mkdir build
cd build
mkdir files
git clone git@github.com:jschmid/WhereAreYou-Web.git -b gh-pages gh-pages
cd ..
cp 404.css build/files/
cp 404.html build/files/
cp icon.png build/files/
cp index.html build/files/
coffee -o build/files -c 404.coffee index.coffee
cd build
cd gh-pages
git rm *
cd ..
cp files/* gh-pages/
cd gh-pages
echo "w.schmid.pro" > CNAME
git add *
git commit -m "Publishing"
git push
