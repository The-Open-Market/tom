const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');

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

    const [
        SELLER_A_ZIP,
        SELLER_B_ZIP,
        DELIVERY_A_ZIP,
        DELIVERY_B_ZIP,
        CLIENT_A_ZIP,
        CLIENT_B_ZIP,
    ] = [
        "AAAA11",
        "BBBB11",
        "AAAA22",
        "BBBB22",
        "AAAA33",
        "BBBB33",
    ];

    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
    let contract;
    let euroContract;

    beforeEach(async () => {
        contract = await TnoEats.deployed();
        euroContract = await EurTno.deployed();
    });

    it("client should be able to start a new order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        assert.equal(0, result.logs[0].args.id.toNumber());
        truffleAssert.eventEmitted(result, 'OrderPending');
        const order = await contract.orders.call(0);
        assert.equal(client_a, order.client);
        assert.equal(seller_a, order.seller);
        assert.equal(NULL_ADDRESS, order.deliveryService);
    });

    it("client should not be able to start an order with invalid seller address", async () => {
        truffleAssert.fails(contract.placeOrder(NULL_ADDRESS, "IPFS_LINK", { from: client_a }));
    });

    it("seller should be able to accept incoming order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[pendingOrder.status.toNumber()]);
        let deliveryFee = 500;
        const approvedResult = await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        truffleAssert.eventEmitted(approvedResult, 'OrderApproved');
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);
    });

    it("delivery service should be able to accept new order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[pendingOrder.status.toNumber()]);
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);
        const acceptedResult = await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.eventEmitted(acceptedResult, 'OrderAccepted');
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal('Accepted', ORDER_STATUSES[acceptedOrder.status.toNumber()]);
        assert.equal(delivery_a, acceptedOrder.deliveryService);
    });

    it("delivery service cannot accept already taken orders", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.acceptOrder(orderId, { from: delivery_b }));
    });

    it("order of acceptance is seller then delivery", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();

        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);

        await contract.acceptOrder(orderId, { from: delivery_a });
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal('Accepted', ORDER_STATUSES[acceptedOrder.status.toNumber()]);
    });

    it("should not be able to accept an invalid order", async () => {
        truffleAssert.fails(contract.approveOrder(1000, SELLER_A_ZIP, CLIENT_A_ZIP, { from: seller_a }));
        truffleAssert.fails(contract.acceptOrder(1000, { from: delivery_a }));
    });

    it("client should be able to instantly refund not processed order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const canceledResult = await contract.cancelOrder(orderId, { from: client_a });
        const canceledOrder = await contract.orders.call(orderId);
        assert.equal('Canceled', ORDER_STATUSES[canceledOrder.status.toNumber()]);
        truffleAssert.eventEmitted(canceledResult, 'OrderCancelled');
    });

    it("seller should be able to reject not processed order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const rejectedResult = await contract.rejectOrder(orderId, { from: seller_a });
        const rejectedOrder = await contract.orders.call(orderId);
        assert.equal('Rejected', ORDER_STATUSES[rejectedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(rejectedResult, 'OrderRejected');
    });

    it("should not be able to reject an invalid order", async () => {
        truffleAssert.fails(contract.rejectOrder(1000, { from: seller_a }));
    });

    it("external seller should not be able to reject an order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        truffleAssert.fails(contract.rejectOrder(orderId, { from: seller_b }));
        const rejectedOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[rejectedOrder.status.toNumber()]);
    });

    it("client/seller should not be able to refund/reject partially accepted order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        truffleAssert.fails(contract.cancelOrder(orderId, { from: client_a }));
        truffleAssert.fails(contract.rejectOrder(orderId, { from: seller_a }));
    });

    it("client should not be able to refund processing order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.cancelOrder(orderId, { from: client_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: seller_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: delivery_a }));
    });
    
    it("deliveryFee should not be higher than the amount in the contract", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = amount + 1;
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a }));
    })

    it("client should not be able to complete not-accepted order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_a }));
    });

    it("seller should not be able to complete not-accepted order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_a }));
    });


    it("seller should not be able to complete order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_a }));
    });

    it("should not be able to complete invalid order", async () => {
        truffleAssert.fails(contract.completeOrder(1000, { from: seller_a }));
        truffleAssert.fails(contract.completeOrder(1000, { from: delivery_a }));
        truffleAssert.fails(contract.completeOrder(1000, { from: seller_a }));
    });

    it("should not be able to refund invalid order", async () => {
        truffleAssert.fails(contract.cancelOrder(1000, { from: client_a }));
        truffleAssert.fails(contract.cancelOrder(1000, { from: seller_a }));
        truffleAssert.fails(contract.cancelOrder(1000, { from: delivery_a }));
    });

    it("external seller should not be able to accept different seller order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, { from: seller_b }));
    });

    it("external party should not be able to complete different seller order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: delivery_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_b }));
    });

    it("external seller should not be able to refund different seller order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        truffleAssert.fails(contract.cancelOrder(orderId, { from: seller_b }));
    });

    it("delivery service picks up order then seller transfers it", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        const pickedupResult = await contract.transferOrder(orderId, { from: delivery_a });
        const pickedUpOrder = await contract.orders.call(orderId);
        assert.equal('PickedUp', ORDER_STATUSES[pickedUpOrder.status.toNumber()]);
        truffleAssert.eventEmitted(pickedupResult, 'OrderPickedUp');
        const inIntransitResult = await contract.transferOrder(orderId, { from: seller_a });
        const intransitOrder = await contract.orders.call(orderId);
        assert.equal('InTransit', ORDER_STATUSES[intransitOrder.status.toNumber()]);
        truffleAssert.eventEmitted(inIntransitResult, 'OrderInTransit');
    });

    it("seller transfers order then delivery service picks it up", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        const transferredResult = await contract.transferOrder(orderId, { from: seller_a });
        const transferredOrder = await contract.orders.call(orderId);
        assert.equal('Transferred', ORDER_STATUSES[transferredOrder.status.toNumber()]);
        truffleAssert.eventEmitted(transferredResult, 'OrderTransferred');
        const inIntransitResult = await contract.transferOrder(orderId, { from: delivery_a });
        const intransitOrder = await contract.orders.call(orderId);
        assert.equal('InTransit', ORDER_STATUSES[intransitOrder.status.toNumber()]);
        truffleAssert.eventEmitted(inIntransitResult, 'OrderInTransit');
    });

    it("seller cannot call transfer twice", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        truffleAssert.fails(contract.transferOrder(orderId, { from: seller_a }));
    });

    it("delivery service cannot call transfer twice", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.transferOrder(orderId, { from: delivery_a }));
    });

    it("intransit order cannot be canceled", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        truffleAssert.fails(contract.cancelOrder(orderId, { from: client_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: seller_a }));
        truffleAssert.fails(contract.cancelOrder(orderId, { from: delivery_a }));
    });

    it("client then delivery service should be able to finalize transaction", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        const receivedResult = await contract.completeOrder(orderId, { from: client_a });
        const receivedOrder = await contract.orders.call(orderId);
        assert.equal('Received', ORDER_STATUSES[receivedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(receivedResult, 'OrderReceived');
        const completedResult = await contract.completeOrder(orderId, { from: delivery_a });
        const completedOrder = await contract.orders.call(orderId);
        assert.equal('Completed', ORDER_STATUSES[completedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(completedResult, 'OrderCompleted');
    });

    it("delivery service then client should be able to finalize transaction", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        const deliveredResult = await contract.completeOrder(orderId, { from: delivery_a });
        const deliveredOrder = await contract.orders.call(orderId);
        assert.equal('Delivered', ORDER_STATUSES[deliveredOrder.status.toNumber()]);
        truffleAssert.eventEmitted(deliveredResult, 'OrderDelivered');
        const completedResult = await contract.completeOrder(orderId, { from: client_a });
        const completedOrder = await contract.orders.call(orderId);
        assert.equal('Completed', ORDER_STATUSES[completedOrder.status.toNumber()]);
        truffleAssert.eventEmitted(completedResult, 'OrderCompleted');
    });

    it("client cannot call complete order twice to finalize transaction #55", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        await contract.completeOrder(orderId, { from: client_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_a }));
    });

    it("delivery service cannot call complete order twice to finalize transaction #55", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        await contract.completeOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: delivery_a }));
    });


    it("client should not be able to transfer his delivery order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.transferOrder(orderId, { from: client_a }));
    });

    it("external party should not be able to transfer different delivery order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.transferOrder(orderId, { from: client_b }));
        truffleAssert.fails(contract.transferOrder(orderId, { from: seller_b }));
        truffleAssert.fails(contract.transferOrder(orderId, { from: delivery_b }));
    });

    it("seller should not be able to complete the order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_a }));
    });

    it("external party should not be able to complete different delivery order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: delivery_b }));
    });

    it("client should not be able to accept his own order", async () => {
        let amount = 1000;
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        const orderId = result.logs[0].args.id.toNumber();
        const deliveryFee = 500;
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, { from: seller_a });
        truffleAssert.fails(contract.acceptOrder(orderId, { from: client_a }));
    });
});
