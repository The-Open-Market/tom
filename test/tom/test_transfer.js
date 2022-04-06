const EurTno = artifacts.require('EurTno')
const TOM = artifacts.require('TOM');
const truffleAssert = require('truffle-assertions');
const { SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TOM transfer", accounts => {
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
