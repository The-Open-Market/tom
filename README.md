# tno-eats

![Smart Contract Test](https://github.com/neat-monte/tno-eats/actions/workflows/main.yml/badge.svg)
![Test Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/neat-monte/38e17eaacdbbcd485a265bb6f916c704/raw/coverage.badge.json)

TNO-Eats implements a city distribution framework for supply-chain management over an Ethereum smart contract, without any intermediate parties. We additionally provide a prototype web-application to demonstrate interacting with the smart contract. The contract allows connecting client, seller, and delivery service and providing the following functions:

- Clients can select a seller and place an order
- Sellers can accept orders from a client and set a delivery reward and collateral required from the delivery service
- Delivery Service can accept an order and provides the collateral
- Seller transfers goods to the Delivery Service and Delivery Service picks up the goods from the Seller
- Delivery Service delivers the order to the Client and Client receives the order from the Delivery Service
- Additionally, the Client can tip the Delivery Service

Payments and collateral are using an ERC20 token (EURTno Token).

## Usage

The contract is deployed on the Kovan testnet, and the web-application is deployed at [neat-monte.github.io/tno-eats](https://neat-monte.github.io/tno-eats), and serves the views of all involved parties. Namely, the client, the delivery service, and the seller view.

To use the application, metamask is required and should be set to use the Kovan testnet (chainId: 42). The application can be run with any Ethereum addresses, however it requires EURT tokens, which can be requested here by opening an issue and including the addresses to be funded with EURT.


## Development setup

There a couple of options for running a development environment. Either it can be run with ganache, or a private network (running PoA). **Note** the mnemonic and the private keys of the accounts used for development are constructable with the information in this repository, hence never use these with actual real Ethereum tokens!

### Ganache

With ganache development is provided in the base docker-compose setup. It can simply be started with

```bash
$ docker-compose up
```

#### Attaching to the container

You can attach to any of the containers. To detach run `exit`, however this also stops the container (can just restart it with `docker-compose up -d` again).

```bash
# Attach to the truffle container
$ docker exec -ti tno-eats bash
```

Then you can run any truffle commands in the truffle container.

```bash
$ truffle compile
```

### PoA Private Geth Network

This runs a private network with a bootnode and two miner nodes that generate blocks (every 5 seconds). This will start each in their own container and run the initial deployment of the contract and serve the frontend.

All accounts are the same as with the ganache setup and are all pre-funded. The command for starting is

```bash
$ docker-compose -f docker-compose-geth.yaml up
```

Note, it will take some time to startup the first time. For using it with metamask on the frontend, we need to change the associated chainId metamask sets for the network (it'll show under localhost:8545). To set the chainId go to the metamask settings, select networks, and set the chainId to `42069`. Additionally, when switching from ganache to geth, the containers need to be reset.

### Troubleshooting

We provide an additional [troubleshooting guide](TROUBLESHOOTING.md) for common issues we came across and how to solve them.
