const EurTno = artifacts.require('EurTno')
const TOM = artifacts.require('TOM');
const truffleAssert = require('truffle-assertions');
const { ORDER_STATUSES, SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TOM reject", accounts => {
    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    let contract;
    let euroContract;

    beforeEach(async () => {
        contract = await TOM.deployed();
        euroContract = await EurTno.deployed();
    });
    
    async function placeOrder() {
        await euroContract.approve(contract.address, AMOUNT, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", AMOUNT, { from: client_a });
        return result.logs[0].args.id.toNumber();
    }
    
    async function approveOrder() {
        const orderId = await placeOrder();
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, DELIVERY_FEE, COLLATERAL, true, { from: seller_a });
        return orderId;
    }

    it("seller should be able to reject not processed order", async () => {
        const orderId = await placeOrder();
        const rejectedResult = await contract.rejectOrder(orderId, { from: seller_a });
        const rejectedOrder = await contract.orders.call(orderId);
        assert.equal('Rejected', ORDER_STATUSES[rejectedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(rejectedResult, 'OrderStatusChanged');
    });

    it("external seller should not be able to reject an order", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.rejectOrder(orderId, { from: seller_b }));
        const rejectedOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[rejectedOrder.status.toNumber()]);
    });

    it("client/seller should not be able to refund/reject approved order", async () => {
        const orderId = await approveOrder();
        truffleAssert.fails(contract.cancelOrder(orderId, { from: client_a }));
        truffleAssert.fails(contract.rejectOrder(orderId, { from: seller_a }));
    });

});
