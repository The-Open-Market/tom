const EurTno = artifacts.require('EurTno')
const TOM = artifacts.require('TOM');
const truffleAssert = require('truffle-assertions');
const { SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TOM complete", accounts => {
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

    it("client should not be able to complete not-accepted order", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_a }));
    });

    it("seller should not be able to complete not-accepted order", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_a }));
    });

    it("seller should not be able to complete order", async () => {
        const orderId = await acceptOrder();
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_a }));
    });

    // what do you test here? That a accepted state cant go to complete?
    it("external party should not be able to complete different seller order", async () => {
        const orderId = await acceptOrder();
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: delivery_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_b }));
    });

    it("client cannot call complete order twice to finalize transaction #55", async () => {
        const orderId = await transferOrder();
        await contract.completeOrder(orderId, { from: client_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_a }));
    });

    it("delivery service cannot call complete order twice to finalize transaction #55", async () => {
        const orderId = await transferOrder();
        await contract.completeOrder(orderId, { from: delivery_a });
        truffleAssert.fails(contract.completeOrder(orderId, { from: delivery_a }));
    });

    it("seller should not be able to complete the order", async () => {
        const orderId = await transferOrder();
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_a }));
    });

    it("external party should not be able to complete different delivery order", async () => {
        const orderId = await transferOrder();
        truffleAssert.fails(contract.completeOrder(orderId, { from: client_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: seller_b }));
        truffleAssert.fails(contract.completeOrder(orderId, { from: delivery_b }));
    });

});