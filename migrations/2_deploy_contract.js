const TnoEats = artifacts.require("TnoEats");
const EurTno = artifacts.require("EurTno");
const BigNumber = require('bignumber.js');

module.exports = async (deployer) => {
  const [client, seller, deliveryService, _client, _seller, _deliveryService] = await web3.eth.getAccounts();

  let oneEurt = new BigNumber('1000000000000000000');
  oneEurt.shiftedBy(-18);

  const eurtContract = await deployer.deploy(EurTno, oneEurt.multipliedBy(6000000));
  await deployer.deploy(TnoEats, EurTno.address);
  await eurtContract.transfer(seller, oneEurt.multipliedBy(1000000), { from: client });
  await eurtContract.transfer(deliveryService, oneEurt.multipliedBy(1000000), { from: client });
  await eurtContract.transfer(_client, oneEurt.multipliedBy(1000000), { from: client });
  await eurtContract.transfer(_seller, oneEurt.multipliedBy(1000000), { from: client });
  await eurtContract.transfer(_deliveryService, oneEurt.multipliedBy(1000000), { from: client });
};
