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

if hash yarn 2>/dev/null; then
  echo "Yarn already installed."
else
  npm install -g yarn
fi

cd /home/tom
yarn
ganache -h 0.0.0.0 -m "intact satisfy device divert math audit pitch coffee secret skill prefer brass" -l 10000000 &
truffle migrate --reset

cd /home/tom/client
npm install --save
chown -R node:node /home/tom

npm run serve
