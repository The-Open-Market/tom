#!/bin/bash
set -e

if hash truffle 2>/dev/null; then
  echo "Truffle already installed."
else
  npm install -g truffle
fi

if hash ganache 2>/dev/null; then
  echo "Ganache already installed."
else
  npm install -g ganache
fi

cd /home/tno-eats/client
npm install --save
chown -R node:node /home/tno-eats

ganache -h 0.0.0.0 &
npm run serve