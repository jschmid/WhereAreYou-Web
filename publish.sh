git checkout gh-pages
git merge master
cp index.html 404.html
git add 404.html
git commit -m "Publishing web"
git push origin gh-pages

