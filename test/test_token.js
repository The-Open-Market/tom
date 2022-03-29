const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');

contract("TnoEats token test", accounts => {
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
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, deliveryFee, collateral, { from: seller_a });
        return orderId;
    }
    
    async function acceptOrder() {
        const orderId = await approveOrder();
        await euroContract.approve(contract.address, collateral, { from: delivery_a });
        await contract.acceptOrder(orderId, { from: delivery_a });
        return orderId;
    }
    
    async function transferOrder() {
        const orderId = await acceptOrder();
        await contract.transferOrder(orderId, { from: delivery_a });
        await contract.transferOrder(orderId, { from: seller_a });
        return orderId;
    }
    
    async function completeOrder() {
        const orderId = await transferOrder();
        await contract.completeOrder(orderId, { from: client_a });
        await contract.completeOrder(orderId, { from: delivery_a });
        return orderId;
    }

    it("approving to little funds should fail", async () => {
        await euroContract.approve(contract.address, 10, { from: client_a });
        truffleAssert.fails(contract.placeOrder(seller_a, "IPFS_LINK", 20, { from: client_a }));
    });
    
    it("approving the exact amount of funds should succeed", async () => {
        await euroContract.approve(contract.address, 20, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", 20, { from: client_a });
        truffleAssert.eventEmitted(result, 'OrderStatusChanged');
    });

    // Should it though?
    it("approving to much funds should succeed", async () => {
        await euroContract.approve(contract.address, 20, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", 10, { from: client_a });
        truffleAssert.eventEmitted(result, 'OrderStatusChanged');
    });
    

    it("cancelling an order should reimburse the client", async () => {
        const balanceStart = await euroContract.balanceOf(client_a);

        await euroContract.approve(contract.address, amount, { from: client_a });
        orderId = await placeOrder();
        const balance2 = await euroContract.balanceOf(client_a);
        // assert.equal(balanceStart + 0, balance2 + amount);
        assert.ok(!balanceStart.eq(balance2));

        await contract.cancelOrder(orderId, { from: client_a });
        const balanceEnd = await euroContract.balanceOf(client_a);
        assert.ok(balanceStart.eq(balanceEnd));
    });
    
    it("rejecting an order shoudl reimburse the client", async () => {
        const balanceStart = await euroContract.balanceOf(client_a);

        await euroContract.approve(contract.address, amount, { from: client_a });
        orderId = await placeOrder();
        const balance2 = await euroContract.balanceOf(client_a);
        // assert.equal(balanceStart + 0, balance2 + amount);
        assert.ok(!balanceStart.eq(balance2));

        await contract.rejectOrder(orderId, { from: seller_a });
        const balanceEnd = await euroContract.balanceOf(client_a);
        assert.ok(balanceStart.eq(balanceEnd));
    });
    
    it("normal transaction gives expected balances", async () => {
        const clientBalance = await euroContract.balanceOf(client_a);
        const sellerBalance = await euroContract.balanceOf(seller_a);
        const deliveryBalance = await euroContract.balanceOf(delivery_a);

        const expClientBalance = clientBalance.subn(amount);
        const expSellerBalance = sellerBalance.addn(amount - deliveryFee);
        const expDeliveryBalance = deliveryBalance.addn(deliveryFee);

        await completeOrder();
        const endClientBalance = await euroContract.balanceOf(client_a);
        const endSellerBalance = await euroContract.balanceOf(seller_a);
        const endDeliveryBalance = await euroContract.balanceOf(delivery_a);
        assert.ok(expClientBalance.eq(endClientBalance));
        assert.ok(expSellerBalance.eq(endSellerBalance));
        assert.ok(expDeliveryBalance.eq(endDeliveryBalance));
        
    });

    it("set new token contract address", async () => {
        truffleAssert.fails(contract.changeEurTnoAddress(contract.address, { from: delivery_b }));
        truffleAssert.fails(contract.changeEurTnoAddress(NULL_ADDRESS));
        const initialAddress = await contract.eurTnoContract.call();
        assert.equal(initialAddress, euroContract.address);
        await contract.changeEurTnoAddress(contract.address);
        const newAddress = await contract.eurTnoContract.call();
        assert.equal(newAddress, contract.address);
    });
    
});
