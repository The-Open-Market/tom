const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');
const { SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TnoEats invalid address", accounts => {
    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    let contract;
    let euroContract;

    beforeEach(async () => {
        contract = await TnoEats.deployed();
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

    it("should not be able to accept an invalid order", async () => {
        truffleAssert.fails(contract.approveOrder(1000, SELLER_A_ZIP, CLIENT_A_ZIP, DELIVERY_FEE, COLLATERAL, true, { from: seller_a }));
        await euroContract.approve(contract.address, COLLATERAL, { from: delivery_a });
        truffleAssert.fails(contract.acceptOrder(1000, { from: delivery_a }));
    });

    it("should not be able to reject an invalid order", async () => {
        truffleAssert.fails(contract.rejectOrder(1000, { from: seller_a }));
    });

    it("should not be able to prepare invalid order", async () => {
        truffleAssert.fails(contract.preparedOrder(1000, { from: seller_a }));
        truffleAssert.fails(contract.preparedOrder(1000, { from: delivery_a }));
        truffleAssert.fails(contract.preparedOrder(1000, { from: seller_a }));
    });

    it("should not be able to transfer invalid order", async () => {
        truffleAssert.fails(contract.transferOrder(1000, { from: seller_a }));
        truffleAssert.fails(contract.transferOrder(1000, { from: delivery_a }));
        truffleAssert.fails(contract.transferOrder(1000, { from: seller_a }));
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
});
