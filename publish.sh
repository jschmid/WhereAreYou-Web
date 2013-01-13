git checkout master
git merge dev
git push origin master




git checkout gh-pages
git merge master
cp index.html 404.html
git add 404.html
git commit -m "Publishing web"

git push origin gh-pages

git checkout dev