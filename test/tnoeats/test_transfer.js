const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');

contract("TnoEats transfer", accounts => {
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



    it("seller cannot call transfer twice", async () => {
        const orderId = await preparedOrder();
        await contract.transferOrder(orderId, { from: seller_a });
        truffleAssert.fails(contract.transferOrder(orderId, { from: seller_a }));
    });

    it("delivery service cannot call transfer twice", async () => {
        const orderId = await preparedOrder();
        await contract.transferOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.transferOrder(orderId, { from: delivery_a }));
    });

    it("approved order cannot be transferred", async () => {
        const orderId = await approveOrder();
        truffleAssert.fails(contract.transferOrder(orderId, { from: client_a }));
        truffleAssert.fails(contract.transferOrder(orderId, { from: seller_a }));
        truffleAssert.fails(contract.transferOrder(orderId, { from: delivery_a }));
    });

    it("client should not be able to transfer his delivery order", async () => {
        const orderId = await acceptOrder();
        truffleAssert.fails(contract.transferOrder(orderId, { from: client_a }));
    });

    it("external party should not be able to transfer different delivery order", async () => {
        const orderId = await acceptOrder();
        truffleAssert.fails(contract.transferOrder(orderId, { from: client_b }));
        truffleAssert.fails(contract.transferOrder(orderId, { from: seller_b }));
        truffleAssert.fails(contract.transferOrder(orderId, { from: delivery_b }));
    });

});
