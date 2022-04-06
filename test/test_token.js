const EurTno = artifacts.require('EurTno')
const TOM = artifacts.require('TOM');
const truffleAssert = require('truffle-assertions');
const { SELLER_A_ZIP, CLIENT_A_ZIP, NULL_ADDRESS, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('./utils/constants');

contract("TOM token test", accounts => {
    // This is copied from the smart contract, enums are returned as integer
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
        await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, DELIVERY_FEE, COLLATERAL, false, { from: seller_a });
        return orderId;
    }
    
    async function acceptOrder() {
        const orderId = await approveOrder();
        await euroContract.approve(contract.address, COLLATERAL, { from: delivery_a });
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

    it("approving too little funds should fail", async () => {
        await euroContract.approve(contract.address, 10, { from: client_a });
        truffleAssert.fails(contract.placeOrder(seller_a, "IPFS_LINK", 20, { from: client_a }));
    });
    
    it("approving the exact AMOUNT of funds should succeed", async () => {
        await euroContract.approve(contract.address, 20, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", 20, { from: client_a });
        truffleAssert.eventEmitted(result, 'OrderStatusChanged');
    });

    it("approving too much funds should succeed", async () => {
        await euroContract.approve(contract.address, 20, { from: client_a });
        const result = await contract.placeOrder(seller_a, "IPFS_LINK", 10, { from: client_a });
        truffleAssert.eventEmitted(result, 'OrderStatusChanged');
    });

    it("accepting with little funds should fail", async () => {
        await euroContract.approve(contract.address, COLLATERAL - 1, { from: client_a });
        const orderId = await approveOrder();
        truffleAssert.fails(contract.acceptOrder(orderId, { from: delivery_a }))
    });

    it("cancelling an order should reimburse the client", async () => {
        const balanceStart = await euroContract.balanceOf(client_a);

        await euroContract.approve(contract.address, AMOUNT, { from: client_a });
        orderId = await placeOrder();
        const balance2 = await euroContract.balanceOf(client_a);
        // assert.equal(balanceStart + 0, balance2 + AMOUNT);
        assert.ok(!balanceStart.eq(balance2));

        await contract.cancelOrder(orderId, { from: client_a });
        const balanceEnd = await euroContract.balanceOf(client_a);
        assert.ok(balanceStart.eq(balanceEnd));
    });
    
    it("rejecting an order shoudl reimburse the client", async () => {
        const balanceStart = await euroContract.balanceOf(client_a);

        await euroContract.approve(contract.address, AMOUNT, { from: client_a });
        orderId = await placeOrder();
        const balance2 = await euroContract.balanceOf(client_a);
        // assert.equal(balanceStart + 0, balance2 + AMOUNT);
        assert.ok(!balanceStart.eq(balance2));

        await contract.rejectOrder(orderId, { from: seller_a });
        const balanceEnd = await euroContract.balanceOf(client_a);
        assert.ok(balanceStart.eq(balanceEnd));
    });
    
    it("normal transaction gives expected balances", async () => {
        const clientBalance = await euroContract.balanceOf(client_a);
        const sellerBalance = await euroContract.balanceOf(seller_a);
        const deliveryBalance = await euroContract.balanceOf(delivery_a);

        const expClientBalance = clientBalance.subn(AMOUNT);
        const expSellerBalance = sellerBalance.addn(AMOUNT - DELIVERY_FEE);
        const expDeliveryBalance = deliveryBalance.addn(DELIVERY_FEE);

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
