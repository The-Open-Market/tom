#!/bin/bash
set -e

if hash truffle 2>/dev/null; then
  echo "Truffle already installed."
else
  npm install -g truffle
fi

cd /home/tom
truffle migrate --network geth

cd /home/tom/client
npm install --save
chown -R node:node /home/tom

npm run serve
