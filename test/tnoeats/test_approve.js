const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');

contract("TnoEats approve", accounts => {
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

    it("seller should be able to approve incoming order", async () => {
        const orderId = await placeOrder();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[pendingOrder.status.toNumber()]);
        let deliveryFee = 500;
        const approvedResult = await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, collateral, true, { from: seller_a });
        truffleAssert.eventEmitted(approvedResult, 'OrderStatusChanged');
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);
    });

    it("deliveryFee should not be higher than the amount in the contract", async () => {
        const orderId = await placeOrder();
        const deliveryFee = amount + 1;
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, collateral, true, { from: seller_a }));
    })

    it("collateral may not be negative", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, -1, true, { from: seller_a }));
    });

    it("external seller should not be able to accept different seller order", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, amount, collateral, true, { from: seller_b }));
    });
});
