const EurTno = artifacts.require('EurTno')
const TOM = artifacts.require('TOM');
const truffleAssert = require('truffle-assertions');
const { ORDER_STATUSES, SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TOM status sequence", accounts => {
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


    it("order of acceptance is seller then delivery", async () => {
        const orderId = await placeOrder();

        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, DELIVERY_FEE, COLLATERAL, true, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);

        await euroContract.approve(contract.address, COLLATERAL, { from: delivery_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal('Accepted', ORDER_STATUSES[acceptedOrder.status.toNumber()]);
    });

    it("delivery service picks up order then seller transfers it", async () => {
        const orderId = await preparedOrder();
        const pickedupResult = await contract.transferOrder(orderId, { from: delivery_a });
        const pickedUpOrder = await contract.orders.call(orderId);
        assert.equal('PickedUp', ORDER_STATUSES[pickedUpOrder.status.toNumber()]);
        truffleAssert.eventEmitted(pickedupResult, 'OrderStatusChanged');
        const inIntransitResult = await contract.transferOrder(orderId, { from: seller_a });
        const intransitOrder = await contract.orders.call(orderId);
        assert.equal('InTransit', ORDER_STATUSES[intransitOrder.status.toNumber()]);
        truffleAssert.eventEmitted(inIntransitResult, 'OrderStatusChanged');
    });

    it("seller transfers order then delivery service picks it up", async () => {
        const orderId = await preparedOrder();
        const transferredResult = await contract.transferOrder(orderId, { from: seller_a });
        const transferredOrder = await contract.orders.call(orderId);
        assert.equal('Transferred', ORDER_STATUSES[transferredOrder.status.toNumber()]);
        truffleAssert.eventEmitted(transferredResult, 'OrderStatusChanged');
        const inIntransitResult = await contract.transferOrder(orderId, { from: delivery_a });
        const intransitOrder = await contract.orders.call(orderId);
        assert.equal('InTransit', ORDER_STATUSES[intransitOrder.status.toNumber()]);
        truffleAssert.eventEmitted(inIntransitResult, 'OrderStatusChanged');
    });

    it("client then delivery service should be able to finalize transaction", async () => {
        const orderId = await transferOrder();
        const receivedResult = await contract.completeOrder(orderId, { from: client_a });
        const receivedOrder = await contract.orders.call(orderId);
        assert.equal('Received', ORDER_STATUSES[receivedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(receivedResult, 'OrderStatusChanged');
        const completedResult = await contract.completeOrder(orderId, { from: delivery_a });
        const completedOrder = await contract.orders.call(orderId);
        assert.equal('Completed', ORDER_STATUSES[completedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(completedResult, 'OrderStatusChanged');
    });

    it("delivery service then client should be able to finalize transaction", async () => {
        const orderId = await transferOrder();
        const deliveredResult = await contract.completeOrder(orderId, { from: delivery_a });
        const deliveredOrder = await contract.orders.call(orderId);
        assert.equal('Delivered', ORDER_STATUSES[deliveredOrder.status.toNumber()]);
        truffleAssert.eventEmitted(deliveredResult, 'OrderStatusChanged');
        const completedResult = await contract.completeOrder(orderId, { from: client_a });
        const completedOrder = await contract.orders.call(orderId);
        assert.equal('Completed', ORDER_STATUSES[completedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(completedResult, 'OrderStatusChanged');
    });

});
