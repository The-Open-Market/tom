const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');
const { ORDER_STATUSES, SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, DELIVERY_FEE, COLLATERAL } = require('../utils/constants');

contract("TnoEats approve", accounts => {
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

    it("seller should be able to approve incoming order", async () => {
        const orderId = await placeOrder();
        const pendingOrder = await contract.orders.call(orderId);
        assert.equal('Pending', ORDER_STATUSES[pendingOrder.status.toNumber()]);
        let DELIVERY_FEE = 500;
        const approvedResult = await contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, DELIVERY_FEE, COLLATERAL, true, { from: seller_a });
        truffleAssert.eventEmitted(approvedResult, 'OrderStatusChanged');
        const approvedOrder = await contract.orders.call(orderId);
        assert.equal('Approved', ORDER_STATUSES[approvedOrder.status.toNumber()]);
    });

    it("DELIVERY_FEE should not be higher than the AMOUNT in the contract", async () => {
        const orderId = await placeOrder();
        const DELIVERY_FEE = AMOUNT + 1;
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, DELIVERY_FEE, COLLATERAL, true, { from: seller_a }));
    })

    it("COLLATERAL may not be negative", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, DELIVERY_FEE, -1, true, { from: seller_a }));
    });

    it("external seller should not be able to accept different seller order", async () => {
        const orderId = await placeOrder();
        truffleAssert.fails(contract.approveOrder(orderId, SELLER_A_ZIP, CLIENT_A_ZIP, AMOUNT, COLLATERAL, true, { from: seller_b }));
    });
});
