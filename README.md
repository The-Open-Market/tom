# TOM: The Open Market

![Smart Contract Test](https://github.com/neat-monte/tom/actions/workflows/main.yml/badge.svg)
![Test Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/neat-monte/38e17eaacdbbcd485a265bb6f916c704/raw/coverage.badge.json)

TOM implements a city distribution framework for supply-chain management over an Ethereum smart contract, without any intermediate parties. We additionally provide a prototype web-application to demonstrate interacting with the smart contract. The contract allows connecting client, seller, and delivery service and providing the following functions:

- Clients can select a seller and place an order
- Sellers can accept orders from a client and set a delivery reward and collateral required from the delivery service
- Delivery Service can accept an order and provides the collateral
- Seller transfers goods to the Delivery Service and Delivery Service picks up the goods from the Seller
- Delivery Service delivers the order to the Client and Client receives the order from the Delivery Service
- Additionally, the Client can tip the Delivery Service

Payments and collateral are using an ERC20 token (EURTno Token). The EURT tokens are distributed to the pre-defined accounts for development, and can additionally be minted by any address for usage of the web-application, using the dashboard in the application.

## Usage

The contract is deployed on the Kovan testnet, and the web-application is deployed at [neat-monte.github.io/tom](https://neat-monte.github.io/tom), and serves the views of all involved parties. Namely, the client, the delivery service, and the seller view. For any transaction, Kovan Ether are required and can be requested from a [Kovan Faucet](https://faucets.chain.link/).

To use the application, metamask is required and should be set to use the Kovan testnet (chainId: 42). The application can be run with any Ethereum addresses, however it requires EURT tokens, which can be requested in the dashboard. To use custom addresses for sellers, simply change the Ethereum address for the seller in the dashboard or add a new seller with the custom address. Additionally, when changing views (e.g. from client to seller view) change the active account in the web3 client such as metamask, and the view will refresh to depict that accounts' orders. Accounts require to be connected to the application (metamask will ask to connect the account on startup) and the connected address should then be shown in the NavBar.

When the delivery service picks up an order from the seller, the seller will physically provide the delivery service with the address and the salt that was used to generate the hash of the address. Using this salt and the address the delivery service can get the original hash from IPFS and compare to the hash that he generates, ensuring the address is correct. For demonstration purposes we provide the salt and hash in the views of the seller and the client, to be copied into the verification fields on the delivery view. **Note** when copying the address all commas and spaces between the address fields (except for the space in the street) need to be removed.

For example an address for `Testing Street 1234 A, ZIP01` should like like this `Testing Street1234AZIP01`.

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
$ docker exec -ti tom bash
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
