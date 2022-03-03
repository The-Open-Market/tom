const TnoEats = artifacts.require("TnoEats");
const utils = require("./utils");

contract("TnoEats", accounts => {
    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
    let contract;

    beforeEach(async () => {
        contract = await TnoEats.deployed();
    });

    it("client should be able to start a new order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        assert.equal(0, result.logs[0].args.orderId.toNumber());
        // TODO: check for emitted events
        const order = await contract.orders.call(0);
        assert.equal(client_a, order.client);
        assert.equal(seller_a, order.seller);
        assert.equal(NULL_ADDRESS, order.deliveryService);
    });

    it("client should not be able to start an order with invalid seller address", async () => {
        utils.assertThrows(contract.placeOrder(NULL_ADDRESS, "IPFS_LINK", { from: client_a }));
    });

    it("seller should be able to accept incoming order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal(0, pendingOrder.status.toNumber());  // Pending=0
        await contract.approveOrder(orderId, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal(1, approvedOrder.status.toNumber());  // Approved=1
    });

    it("delivery service should be able to accept new order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal(0, pendingOrder.status.toNumber());  // Pending=0
        await contract.approveOrder(orderId, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal(1, approvedOrder.status.toNumber());  // Approved=1
        await contract.acceptOrder(orderId, { from: delivery_a });
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal(2, acceptedOrder.status.toNumber()); // Accepted=2
        assert.equal(delivery_a, acceptedOrder.deliveryService);
    });

    it("delivery service cannot accept already taken orders", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.acceptOrder(orderId, { from: delivery_b }));
    });

    it("order of acceptance is seller then delivery", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();

        await contract.approveOrder(orderId, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal(1, approvedOrder.status.toNumber());  // Approved=1

        await contract.acceptOrder(orderId, { from: delivery_a });
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal(2, acceptedOrder.status.toNumber()); // Accepted=2
    });

    xit("client should not be able to accept his own order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        utils.assertThrows(contract.acceptOrder(orderId, { from: client_a }));
    });

    it("should not be able to accept an invalid order", async () => {
        utils.assertThrows(contract.approveOrder(1000, { from: seller_a }));
        utils.assertThrows(contract.acceptOrder(1000, { from: delivery_a }));
    });

    it("client should be able to instantly refund not processed order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.cancelOrder(orderId, { from: client_a });
        const canceledOrder = await contract.orders.call(orderId);
        assert.equal(10, canceledOrder.status.toNumber());  // Canceled=10
    });

    it("client should not be able to refund partially accepted order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        utils.assertThrows(contract.cancelOrder(orderId, { from: client_a }));
    });

    it("client should not be able to refund processing order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.cancelOrder(orderId, { from: client_a }));
        utils.assertThrows(contract.cancelOrder(orderId, { from: seller_a }));
        utils.assertThrows(contract.cancelOrder(orderId, { from: delivery_a }));
    });

    it("client should not be able to complete not-accepted order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        utils.assertThrows(contract.completeOrder(orderId, { from: client_a }));
    });

    xit("seller should not be able to complete not-accepted order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        utils.assertThrows(contract.completeOrder(orderId, { from: seller_a }));
    });

    xit("client and delivery service should be able to finalize transaction", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.completeOrder(orderId, { from: client_a });
        // TODO: Check status again
        await contract.completeOrder(orderId, { from: delivery_a });
        // TODO: Check status again
    });

    it("seller should not be able to complete order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.completeOrder(orderId, { from: seller_a }));
    });

    it("should not be able to complete invalid order", async () => {
        utils.assertThrows(contract.completeOrder(1000, { from: seller_a }));
        utils.assertThrows(contract.completeOrder(1000, { from: delivery_a }));
        utils.assertThrows(contract.completeOrder(1000, { from: seller_a }));
    });

    it("should not be able to refund invalid order", async () => {
        utils.assertThrows(contract.cancelOrder(1000, { from: client_a }));
        utils.assertThrows(contract.cancelOrder(1000, { from: seller_a }));
        utils.assertThrows(contract.cancelOrder(1000, { from: delivery_a }));
    });

    it("external seller should not be able to accept different seller order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        utils.assertThrows(contract.approveOrder(orderId, { from: seller_b }));
    });

    it("external party should not be able to complete different seller order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.completeOrder(orderId, { from: seller_b }));
        utils.assertThrows(contract.completeOrder(orderId, { from: delivery_b }));
        utils.assertThrows(contract.completeOrder(orderId, { from: client_b }));
    });

    it("external seller should not be able to refund different seller order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        utils.assertThrows(contract.cancelOrder(orderId, { from: seller_b }));
    });

    xit("external delivery service should not be able to complete different delivery order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.completeOrder(orderId, { from: delivery_b }));
    });

    xit("client can call complete order twice to finalize transaction #55", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.completeOrder(orderId, { from: client_a });
        await contract.completeOrder(orderId, { from: client_a });
        const completedOrder = await contract.orders.call(orderId);
        assert.equal(false, completedOrder.status.toNumber() == 8);  // Completed=8
    });

});
