const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');
const { ORDER_STATUSES, SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TnoEats cancel", accounts => {
    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    let contract;
    let euroContract;

    beforeEach(async () => {
        contract = await TnoEats.deployed();
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
    
    async function acceptOrder() {
        const orderId = await approveOrder();
        await euroContract.approve(contract.address, COLLATERAL, { from: delivery_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        return orderId;
    }
    
    async function preparedOrder() {
        const orderId = await acceptOrder();
        await contract.preparedOrder(orderId, { from: seller_a });
        return orderId;
    }
    
    async function transferOrder() {
        const orderId = await preparedOrder();
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        return orderId;
    }

    it("client should be able to instantly refund not processed order", async () => {
        const orderId = await placeOrder();
        const canceledResult = await contract.cancelOrder(orderId, { from: client_a });
        const canceledOrder = await contract.orders.call(orderId);
        assert.equal('Cancelled', ORDER_STATUSES[canceledOrder.status.toNumber()]);
        truffleAssert.eventEmitted(canceledResult, 'OrderStatusChanged');
    });

    it("client/seller should not be able to refund/reject approved order", async () => {
        const orderId = await approveOrder();
        truffleAssert.fails(contract.cancelOrder(orderId, { from: client_a }));
    });

    it("client should not be able to refund processing order", async () => {
        const orderId = await acceptOrder();
        truffleAssert.fails(contract.cancelOrder(orderId, { from: client_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: seller_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: delivery_a }));
    });

    it("intransit order cannot be canceled", async () => {
        const orderId = await transferOrder();
        truffleAssert.fails(contract.cancelOrder(orderId, { from: client_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: seller_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: delivery_a }));
    });

    it("external seller should not be able to refund different seller order", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.cancelOrder(orderId, { from: seller_b }));
    });
    
});