const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');
const { AMOUNT, NULL_ADDRESS } = require('../utils/constants');

contract("TnoEats place", accounts => {
    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    let contract;
    let euroContract;

    beforeEach(async () => {
        contract = await TnoEats.deployed();
        euroContract = await EurTno.deployed();
    });

    it("client should be able to start a new order", async () => {
        await euroContract.approve(contract.address, AMOUNT, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", AMOUNT, { from: client_a });
        truffleAssert.eventEmitted(result, 'OrderStatusChanged');
        const order = await contract.orders.call(result.logs[0].args.id.toNumber());
        assert.equal(client_a, order.client);
        assert.equal(seller_a, order.seller);
        assert.equal(NULL_ADDRESS, order.deliveryService);
    });

});