#!/bin/sh

set -e

npm ci
NODE_ENV=production npm run build

cd dist
cp index.html 404.html

author="$(git log | grep Author | awk '{print $2;exit}')"
email="$(git log | grep Author | awk '{print $3;exit}' | sed -e 's/[<>]//g')"
coauthor="$(git log -1 | grep -m1 Co-authored-by)"

git init -b gh-pages
git config user.name $author
git config user.email $email
git add -A
git commit -m "page deployment" -m $coauthor
git remote add origin https://github.com/nicktehrany/tno-eats
git push -f origin gh-pages

cd -