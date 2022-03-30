# Troubleshooting Guide

This guide provides troubleshooting for some of the common errors that can be encountered.

## Stuck Transactions and Underpriced Transactions error

Metamask transactions are not going through, typically a confirmation notification shows up when a transaction is successful and the ganache log will show a transaction, but in this issue no confirmation is showing up. Or metamask will report `Underpriced Transaction error` and all later transactions will fail as well.

### Fix 

There are several options to fix this:
1. Reset the client's account. On metamask go to the account's settings (click on account icon in top right corner -> settings) -> advanced -> Reset account and confirm resetting.
2. If just client account reset does not work, run the truffle migration again with a full reset `truffle migrate --reset`, and then reset the client account again (Best to reset all accounts).
3. Restart the docker container and run a new migration with a reset. And again reset the accounts as well.

## Geth Private Network not starting frontend Node

This happens when switching from the ganache development to the private network with geth. It uses the same frontend node from the docker setup, however a slightly different entrypoint, hence we need to reset that container and restart it with the new entrypoint. This can simply be done by

```bash
$ docker-compose down
# then start geth docker
$ docker-compose -f docker-compose-geth.yaml up
```

## Could not decrypt Error

If there are any errors for not being able to decrypt an order. Simply delete the local storage in the web-application.