#!/bin/sh

set -e

npm ci
NODE_ENV=production npm run build

cd dist
cp index.html 404.html

git init -b gh-pages
git add -A
git commit -m 'page deployment'
git remote add origin https://github.com/nicktehrany/tno-eats
git push -f origin gh-pages

cd -