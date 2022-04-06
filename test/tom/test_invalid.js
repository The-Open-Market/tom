const EurTno = artifacts.require('EurTno')
const TOM = artifacts.require('TOM');
const truffleAssert = require('truffle-assertions');
const { SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TOM invalid address", accounts => {
    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    let contract;
    let euroContract;

    beforeEach(async () => {
        contract = await TOM.deployed();
        euroContract = await EurTno.deployed();
    });

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
