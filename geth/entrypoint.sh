#!/bin/bash
set -e

if hash truffle 2>/dev/null; then
  echo "Truffle already installed."
else
  npm install -g truffle
fi

cd /home/tno-eats
truffle migrate

cd /home/tno-eats/client
npm install --save
chown -R node:node /home/tno-eats

npm run serve
