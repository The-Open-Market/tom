#!/bin/sh

set -e
set -x

npm ci
NODE_ENV=production npm run build

cd dist
cp index.html 404.html

author="$(git log -1 --format='%an' | grep Author | awk '{print $2;exit}')"
email="$(git log -1 | grep Author | awk '{print $3;exit}' | sed -e 's/[<>]//g')"
coauthor="$(git log -1 | grep Co-authored-by)"

git init -b gh-pages
git config user.name "$author"
git config user.email "$email"
git add -A
git commit -m "page deployment" -m "$coauthor"
git remote add origin "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_ACTOR}/${REPOSITORY}.git"
git push -f origin gh-pages

cd -