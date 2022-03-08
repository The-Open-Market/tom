const TnoEats = artifacts.require("TnoEats");
const utils = require("./utils");

contract("TnoEats", accounts => {
    // This is copied from the smart contract, enums are returned as integer
    const ORDER_STATUSES = [
        'Pending',     /* order is submitted by a client                       */
        'Approved',    /* order is approved by a seller                        */
        'Rejected',    /* order is rejected by a seller                        */
        'Accepted',    /* order is accepted by a delivery service              */
        'PickedUp',    /* order is picked up by a delivery service             */
        'Transferred', /* order is transferred by a seller to delivery service */
        'InTransit',   /* order is being delivered by the delivery service     */
        'Received',    /* order is received by a client                        */
        'Delivered',   /* order is delivered by a delivery service             */
        'Completed',   /* order is sucessfully completed                       */
        'Disputed',    /* order is disputed by one of the parties              */
        'Canceled'     /* order is cancelled before reaching Processing status */
    ];

    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
    let contract;

    beforeEach(async () => {
        contract = await TnoEats.deployed();
    });

    it("client should be able to start a new order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        assert.equal(0, result.logs[0].args.orderId.toNumber());
        assert.equal("OrderPlaced", result.logs[0].event);
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
        assert.equal('Pending', ORDER_STATUSES[pendingOrder.status.toNumber()]);
        const approvedResult = await contract.approveOrder(orderId, { from: seller_a });
        assert.equal("OrderApproved", approvedResult.logs[0].event);
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);
    });

    it("delivery service should be able to accept new order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[pendingOrder.status.toNumber()]);
        await contract.approveOrder(orderId, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);
        const acceptedResult = await contract.acceptOrder(orderId, { from: delivery_a });
        assert.equal("OrderAccepted", acceptedResult.logs[0].event);
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal('Accepted', ORDER_STATUSES[acceptedOrder.status.toNumber()]);
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
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);

        await contract.acceptOrder(orderId, { from: delivery_a });
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal('Accepted', ORDER_STATUSES[acceptedOrder.status.toNumber()]);
    });

    it("should not be able to accept an invalid order", async () => {
        utils.assertThrows(contract.approveOrder(1000, { from: seller_a }));
        utils.assertThrows(contract.acceptOrder(1000, { from: delivery_a }));
    });

    it("client should be able to instantly refund not processed order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        const canceledResult = await contract.cancelOrder(orderId, { from: client_a });
        const canceledOrder = await contract.orders.call(orderId);
        assert.equal('Canceled', ORDER_STATUSES[canceledOrder.status.toNumber()]);
        assert.equal("OrderCancelled", canceledResult.logs[0].event);
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

    it("seller should not be able to complete not-accepted order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        utils.assertThrows(contract.completeOrder(orderId, { from: seller_a }));
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

    it("delivery service picks up order then seller transfers it", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        const pickedUpOrder = await contract.orders.call(orderId);
        assert.equal('PickedUp', ORDER_STATUSES[pickedUpOrder.status.toNumber()]);
        const inIntransitResult = await contract.transferOrder(orderId, { from: seller_a });
        const intransitOrder = await contract.orders.call(orderId);
        assert.equal('InTransit', ORDER_STATUSES[intransitOrder.status.toNumber()]);
        assert.equal("OrderInTransit", inIntransitResult.logs[0].event);
    });

    it("seller transfers order then delivery service picks it up", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        const transferredOrder = await contract.orders.call(orderId);
        assert.equal('Transferred', ORDER_STATUSES[transferredOrder.status.toNumber()]);
        const inIntransitResult = await contract.transferOrder(orderId, { from: delivery_a });
        const intransitOrder = await contract.orders.call(orderId);
        assert.equal('InTransit', ORDER_STATUSES[intransitOrder.status.toNumber()]);
        assert.equal("OrderInTransit", inIntransitResult.logs[0].event);
    });

    it("seller cannot call transfer twice", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        utils.assertThrows(contract.transferOrder(orderId, { from: seller_a }));
    });

    it("delivery service cannot call transfer twice", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.transferOrder(orderId, { from: delivery_a }));
    });

    it("intransit order cannot be canceled", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        utils.assertThrows(contract.cancelOrder(orderId, { from: client_a }));
        utils.assertThrows(contract.cancelOrder(orderId, { from: seller_a }));
        utils.assertThrows(contract.cancelOrder(orderId, { from: delivery_a }));
    });

    it("client then delivery service should be able to finalize transaction", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        await contract.completeOrder(orderId, { from: client_a });
        const receivedOrder = await contract.orders.call(orderId);
        assert.equal('Received', ORDER_STATUSES[receivedOrder.status.toNumber()]);
        const completedResult = await contract.completeOrder(orderId, { from: delivery_a });
        const completedOrder = await contract.orders.call(orderId);
        assert.equal('Completed', ORDER_STATUSES[completedOrder.status.toNumber()]);
        assert.equal("OrderCompleted", completedResult.logs[0].event);
    });

    it("delivery service then client should be able to finalize transaction", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        await contract.completeOrder(orderId, { from: delivery_a });
        const deliveredOrder = await contract.orders.call(orderId);
        assert.equal('Delivered', ORDER_STATUSES[deliveredOrder.status.toNumber()]);
        const completedResult = await contract.completeOrder(orderId, { from: client_a });
        const completedOrder = await contract.orders.call(orderId);
        assert.equal('Completed', ORDER_STATUSES[completedOrder.status.toNumber()]);
        assert.equal("OrderCompleted", completedResult.logs[0].event);
    });

    it("client cannot call complete order twice to finalize transaction #55", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        await contract.completeOrder(orderId, { from: client_a });
        utils.assertThrows(contract.completeOrder(orderId, { from: client_a }));
    });

    it("delivery service cannot call complete order twice to finalize transaction #55", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        await contract.completeOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.completeOrder(orderId, { from: delivery_a }));
    });


    it("client should not be able to transfer his delivery order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.transferOrder(orderId, { from: client_a }));
    });

    it("external party should not be able to transfer different delivery order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        utils.assertThrows(contract.transferOrder(orderId, { from: client_b }));
        utils.assertThrows(contract.transferOrder(orderId, { from: seller_b }));
        utils.assertThrows(contract.transferOrder(orderId, { from: delivery_b }));
    });

    it("seller should not be able to complete the order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        utils.assertThrows(contract.completeOrder(orderId, { from: seller_a }));
    });

    it("external party should not be able to complete different delivery order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        utils.assertThrows(contract.completeOrder(orderId, { from: client_b }));
        utils.assertThrows(contract.completeOrder(orderId, { from: seller_b }));
        utils.assertThrows(contract.completeOrder(orderId, { from: delivery_b }));
    });

    it("client should not be able to accept his own order", async () => {
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", { from: client_a });
        const orderId = result.logs[0].args.orderId.toNumber();
        await contract.approveOrder(orderId, { from: seller_a });
        utils.assertThrows(contract.acceptOrder(orderId, { from: client_a }));
    });

});
