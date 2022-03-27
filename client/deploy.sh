#!/bin/sh

set -e
set -x

npm ci
NODE_ENV=production npm run build

cd dist
cp index.html 404.html

author="$(git log -1 --format='%an')"
email="$(git log -1 --format='%ae')"

git init -b gh-pages
git config user.name "$author"
git config user.email "$email"
git add -A
git commit -m "page deployment"
git remote add origin "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_ACTOR}/${REPOSITORY}.git"
git push -f origin gh-pages

cd -