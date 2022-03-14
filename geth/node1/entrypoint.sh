#!/bin/sh

rm -rf geth node1/geth 

geth --datadir node1/ init genesis.json

geth --datadir /home/node1 --syncmode 'full' --port 30311 --allow-insecure-unlock --http --http.addr="0.0.0.0" --http.api="eth,web3,net,admin,personal,miner" --http.corsdomain="*" --bootnodes enode://38b65ead58d04bf638908d7993f0d82444bd09fec3f72b61e84dd557f102dc463c359d9ab9c7e408eb48a9876fb92f612c21cf0860f3cb1cc53020fe083b3f38@geth-bootnode:30310 --networkid 42069 --unlock '0x39C2F8Fa93d176363c20A5bFe52d9E392dB14aD5' --password '/home/node1/password.dat' --mine --miner.threads=1
