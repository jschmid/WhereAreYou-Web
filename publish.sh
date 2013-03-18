#!/bin/bash

set -e

git checkout master

cd build
git clone git@github.com:jschmid/WhereAreYou-Web.git -b gh-pages gh-pages
cd gh-pages
git rm *
cd ..
cp files/* gh-pages/
cd gh-pages
echo "w.schmid.pro" > CNAME
git add *
git commit -m "Publishing"
git push
