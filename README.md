# tno-eats

![Smart Contract Test](https://github.com/neat-monte/tno-eats/actions/workflows/main.yml/badge.svg)

## TO DEBUG

commands for starting manually

```bash
# bootnode
bootnode -nodekey boot.key -verbosity 9 -addr :30310
```

Mining node with http

```bash
geth --datadir "node1" --syncmode 'full' --port 30311 --allow-insecure-unlock --http --http.addr="0.0.0.0" --http.api="eth,web3,net,admin,personal,miner" --http.corsdomain="*" --bootnodes "enode://38b65ead58d04bf638908d7993f0d82444bd09fec3f72b61e84dd557f102dc463c359d9ab9c7e408eb48a9876fb92f612c21cf0860f3cb1cc53020fe083b3f38@127.0.0.1:0?discport=30310" --networkid 42069 --unlock '0x39C2F8Fa93d176363c20A5bFe52d9E392dB14aD5' --password 'node1/password.dat' --mine
```

Mining node 

```bash
geth --datadir "node2" --syncmode 'full' --port 30312 --allow-insecure-unlock --bootnodes "enode://38b65ead58d04bf638908d7993f0d82444bd09fec3f72b61e84dd557f102dc463c359d9ab9c7e408eb48a9876fb92f612c21cf0860f3cb1cc53020fe083b3f38@127.0.0.1:0?discport=30310" --networkid 42069 --unlock '0x666668DEb000a9cc8D4Ccc8a449BC944Dae8bc74' --password 'node2/password.dat' --mine
```

### with docker

with docker-compose we can send requests to the http node

```bash
curl --location --request POST 'localhost:8545/' \
--header 'Content-Type: application/json' \
--data-raw '{
        "jsonrpc":"2.0",
        "method":"eth_getBlockByNumber",
        "params":["latest", false],
        "id":1
}'
```

## Development setup

### Starting docker containers

This starts a container with ganache, truffle, and the vue webserver.

```bash
docker-compose up -d
```

### Attaching to the container

You can attach to any of the containers. To detach run `exit`, however this also stops the container (can just restart it with `docker-compose up -d` again).

```bash
# Attach to the truffle container
docker exec -ti tno-eats bash
```

Then you can run any truffle commands in the truffle container.

```bash
truffle compile
```

### Cleanup/Misc

```bash
# To stop docker-compose
docker-compose down
```

```bash
# if modifying Dockerfile, rebuild image
docker-compose build
```
