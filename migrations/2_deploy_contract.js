const TnoEats = artifacts.require("TnoEats");
const EurTno = artifacts.require("EurTno");
const BigNumber = require('bignumber.js');

let oneEurt = new BigNumber('1000000000000000000');
oneEurt.shiftedBy(-18);

async function addDemoData(eurtContract, tnoEatsContract, network, [client, seller, deliveryService, _client, _seller, _deliveryService]) {
  if (!network.endsWith('demo')) {
    return;
  }

  const IPFS_LINK = 'QmVnQJyEmrzvgjJX9WqfV3WRRb4uZz4SwuYmYnBJXc4pix';

  for (let i = 0; i < 10; ++i) {
    await eurtContract.approve(tnoEatsContract.address, oneEurt.multipliedBy(10), { from: client });
    const result = await tnoEatsContract.placeOrder(seller, IPFS_LINK, oneEurt.multipliedBy(10), { from: client });
    const orderId = result.logs[0].args.id.toNumber();
    console.log(`Order ${orderId}`);
    if (i == 9) {
      console.log(`Canceling ${orderId}`);      
      await tnoEatsContract.cancelOrder(orderId, { from: client });
    } else if (i == 8) {
      console.log(`Rejecting ${orderId}`);
      await tnoEatsContract.rejectOrder(orderId, { from: seller });
    }

    if (i > 6) continue;
    console.log(`Approving ${orderId}`);
    await tnoEatsContract.approveOrder(orderId, "SELLER01", "CLIENT02", oneEurt.multipliedBy(i), oneEurt.multipliedBy(10), { from: seller });

    if (i > 5) continue;

    await eurtContract.approve(tnoEatsContract.address, oneEurt.multipliedBy(10), { from: deliveryService });

    console.log(`Accepting ${orderId}`);
    await tnoEatsContract.acceptOrder(orderId, { from: deliveryService });

    if (i > 4) continue;

    console.log(`Transfering ${orderId}`);
    if (i % 2 == 0) {
      await tnoEatsContract.transferOrder(orderId, { from: seller });
      await tnoEatsContract.transferOrder(orderId, { from: deliveryService });
    } else {
      await tnoEatsContract.transferOrder(orderId, { from: deliveryService });
      await tnoEatsContract.transferOrder(orderId, { from: seller });
    }

    if (i > 2) continue;

    console.log(`Completing ${orderId}`);
    if (i % 2 == 0) {
      await tnoEatsContract.completeOrder(orderId, { from: client });
      await tnoEatsContract.completeOrder(orderId, { from: deliveryService });
    } else {
      await tnoEatsContract.completeOrder(orderId, { from: deliveryService });
      await tnoEatsContract.completeOrder(orderId, { from: client });
    }
  }
}

module.exports = async (deployer, network) => {
    if(network === "geth") {
        const [deployAddress, client, seller, deliveryService, _client, _seller, _deliveryService] = await web3.eth.getAccounts();

        await deployer.deploy(EurTno, oneEurt.multipliedBy(6000000));
        const eurtContract = await EurTno.deployed();

        await deployer.deploy(TnoEats, eurtContract.address);
        const tnoEatsContract = await TnoEats.deployed();

        await eurtContract.transfer(client, oneEurt.multipliedBy(1000000), { from: deployAddress });
        await eurtContract.transfer(seller, oneEurt.multipliedBy(1000000), { from: deployAddress });
        await eurtContract.transfer(deliveryService, oneEurt.multipliedBy(1000000), { from: deployAddress });
        await eurtContract.transfer(_client, oneEurt.multipliedBy(1000000), { from: deployAddress });
        await eurtContract.transfer(_seller, oneEurt.multipliedBy(1000000), { from: deployAddress });
        await eurtContract.transfer(_deliveryService, oneEurt.multipliedBy(1000000), { from: deployAddress });
        await addDemoData(eurtContract, tnoEatsContract, network, [client, seller, deliveryService, _client, _seller, _deliveryService]);

        console.log(`EURT: ${eurtContract.address}`);
    } else {
        const [client, seller, deliveryService, _client, _seller, _deliveryService] = await web3.eth.getAccounts();

        const eurtContract = await deployer.deploy(EurTno, oneEurt.multipliedBy(6000000));
        const tnoEatsContract = await deployer.deploy(TnoEats, EurTno.address);

        await eurtContract.transfer(seller, oneEurt.multipliedBy(1000000), { from: client });
        await eurtContract.transfer(deliveryService, oneEurt.multipliedBy(1000000), { from: client });
        await eurtContract.transfer(_client, oneEurt.multipliedBy(1000000), { from: client });
        await eurtContract.transfer(_seller, oneEurt.multipliedBy(1000000), { from: client });
        await eurtContract.transfer(_deliveryService, oneEurt.multipliedBy(1000000), { from: client });
        await addDemoData(eurtContract, tnoEatsContract, network, [client, seller, deliveryService, _client, _seller, _deliveryService]);

        console.log(`EURT: ${eurtContract.address}`);
    }
};
