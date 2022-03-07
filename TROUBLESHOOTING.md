# Troubleshooting Guide

This guide provides troubleshooting for some of the common errors that can be encountered.

## Stuck Transactions and Underpriced Transactions error

Metamask transactions are not going through, typically a confirmation notification shows up when a transaction is successful and the ganache log will show a transaction, but in this issue no confirmation is showing up. Or metamask will report ```Underpriced Transaction error``` and all later transactions will fail as well.

### Fix 

There are several options to fix this:
1. Reset the client's account. On metamask go to the account's settings (click on account icon in top right corner -> settings) -> advanced -> Reset account and confirm resetting.
2. If just client account reset does not work, run the truffle migration again with a full reset ```truffle migrate --reset```, and then reset the client account again (Best to reset all accounts).
3. Restart the docker container and run a new migration with a reset. And again reset the accounts as well.
