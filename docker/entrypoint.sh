#!/bin/bash
set -e

npm install -g truffle ganache

cd /home/tno-eats/client
npm install
chown -R node:node /home/tno-eats

ganache -h 0.0.0.0 &
npm run serve
