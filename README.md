# tno-eats

![Smart Contract Test](https://github.com/neat-monte/tno-eats/actions/workflows/main.yml/badge.svg)

## Development setup

There a couple of options for running a development environment. Either it can be run with ganache, or a private network (running PoA). 

### Ganache

With ganache development is provided in the base docker-compose setup. It can simply be started with

```bash
$ docker-compose up
```

#### Attaching to the container

You can attach to any of the containers. To detach run `exit`, however this also stops the container (can just restart it with `docker-compose up -d` again).

```bash
# Attach to the truffle container
docker exec -ti tno-eats bash
```

Then you can run any truffle commands in the truffle container.

```bash
truffle compile
```

### PoA Private Geth Network

This runs a private network with a bootnode and two miner nodes that generate blocks (every 5 seconds). This will start each in their own container and run the initial deployment of the contract and serve the frontend.

All accounts are the same as with the ganache setup and are all pre-funded. The command for starting is

```bash
$ docker-compose -f docker-compose-geth.yaml up
```

Note, it will take some time to startup the first time. For using it with metamask on the frontend, we need to change the associated chainId metamask sets for the network (it'll show under localhost:8545). To set the chainId go to the metamask settings, select networks, and set the chainId to `42069`.
