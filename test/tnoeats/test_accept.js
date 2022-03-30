const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');

contract("TnoEats accept", accounts => {
    // This is copied from the smart contract, enums are returned as integer
    const ORDER_STATUSES = [
        'Pending',     /* 0  order is submitted by a client                       */
        'Approved',    /* 1  order is approved by a seller                        */
        'Accepted',    /* 2  (optional) order is accepted by a delivery service   */
        'Ready',       /* 3  order is ready for pickup                            */
        'PickedUp',    /* 4  order is picked up by a delivery service             */
        'Transferred', /* 5  order is transferred by a seller to delivery service */
        'InTransit',   /* 6  order is being delivered by the delivery service     */
        'Received',    /* 7  order is received by a client                        */
        'Delivered',   /* 8  order is delivered by a delivery service             */
        'Completed',   /* 9  order is sucessfully completed                       */
        'Cancelled',   /* 10 order is cancelled before reaching Processing status */
        'Rejected'     /* 11  order is rejected by a seller                       */
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
    const amount = 1000;
    const deliveryFee = 200;
    const collateral = 300;

    beforeEach(async () => {
        contract = await TnoEats.deployed();
        euroContract = await EurTno.deployed();
    });
    
    async function placeOrder() {
        await euroContract.approve(contract.address, amount, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", amount, { from: client_a });
        return result.logs[0].args.id.toNumber();
    }
    
    async function approveOrder() {
        const orderId = await placeOrder();
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, collateral, true, { from: seller_a });
        return orderId;
    }

    async function acceptOrder() {
        const orderId = await approveOrder();
        await euroContract.approve(contract.address, collateral, { from: delivery_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        return orderId;
    }

    it("delivery service should be able to accept new order", async () => {
        const orderId = await placeOrder();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[pendingOrder.status.toNumber()]);
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, collateral, true, { from: seller_a });
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);
        await euroContract.approve(contract.address, collateral, { from: delivery_a });
        const acceptedResult = await contract.acceptOrder(orderId, { from: delivery_a });
        truffleAssert.eventEmitted(acceptedResult, 'OrderStatusChanged');
        const acceptedOrder = await contract.orders.call(orderId);
        assert.equal('Accepted', ORDER_STATUSES[acceptedOrder.status.toNumber()]);
        assert.equal(delivery_a, acceptedOrder.deliveryService);
    });

    it("delivery service cannot accept already taken orders", async () => {
        const orderId = await acceptOrder();
        await euroContract.approve(contract.address, collateral, { from: delivery_b });
        truffleAssert.fails(contract.acceptOrder(orderId, { from: delivery_b }));
    });

    it("client should not be able to accept his own order", async () => {
        const orderId = await placeOrder();
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, collateral, true, { from: seller_a });
        await euroContract.approve(contract.address, collateral, { from: client_a });
        truffleAssert.fails(contract.acceptOrder(orderId, { from: client_a }));
    });

    it("seller should not be able to accept his own order", async () => {
        const orderId = await placeOrder();
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, collateral, true, { from: seller_a });
        await euroContract.approve(contract.address, collateral, { from: client_a });
        truffleAssert.fails(contract.acceptOrder(orderId, { from: seller_a }));
    });

});
