#!/bin/sh

rm -rf geth node2/geth 

geth --datadir node2/ init genesis.json

geth --datadir /home/node2 --syncmode 'full' --port 30312 --allow-insecure-unlock --bootnodes enode://38b65ead58d04bf638908d7993f0d82444bd09fec3f72b61e84dd557f102dc463c359d9ab9c7e408eb48a9876fb92f612c21cf0860f3cb1cc53020fe083b3f38@geth-bootnode:30310 --networkid 42069 --unlock '0x666668DEb000a9cc8D4Ccc8a449BC944Dae8bc74' --password '/home/node2/password.dat' --mine --miner.threads=1
