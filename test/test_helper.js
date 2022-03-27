const EurTno = artifacts.require('EurTno')
const TnoEats = artifacts.require('TnoEats');
const truffleAssert = require('truffle-assertions');

contract("Test helper", accounts => {
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

    const SELLER_ZIP = "AAAA11";
    const CLIENT_ZIP = "BBBB22";

    const [seller_a, seller_b, delivery_a, delivery_b, client_a, client_b] = accounts;
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
    let contract;
    let euroContract;
    const amount = 1000;
    const deliveryFee = 200;
    const collateral = 300;
    
    const COMPLETED = '0';
    const CANCELED = '1';

    beforeEach(async () => {
        contract = await TnoEats.deployed();
        euroContract = await EurTno.deployed();
    });
    
    async function completeOrder(client, seller=seller_a, deliverer=delivery_a) {
        await euroContract.approve(contract.address, amount, { from: client });
        const result = await contract.placeOrder(seller, "IPFS_LINK", amount, { from: client });
        const orderId =  result.logs[0].args.id.toNumber();
        
        await contract.approveOrder(orderId, SELLER_ZIP, CLIENT_ZIP, deliveryFee, collateral, { from: seller });

        await euroContract.approve(contract.address, collateral, { from: deliverer });
        await contract.acceptOrder(orderId, { from: deliverer });

        await contract.transferOrder(orderId, { from: deliverer });
        await contract.transferOrder(orderId, { from: seller });

        await contract.completeOrder(orderId, { from: client });
        await contract.completeOrder(orderId, { from: deliverer });
    }
    
    async function cancelOrder(client, seller=seller_a) {
        await euroContract.approve(contract.address, amount, { from: client });
        const result = await contract.placeOrder(seller, "IPFS_LINK", amount, { from: client });
        const orderId =  result.logs[0].args.id.toNumber();

        await contract.cancelOrder(orderId, { from: client });
    }

    it("test getClientOrder", async () => {
        let result = await contract.getClientOrderCount(client_a);
        assert.ok(result[COMPLETED].eqn(0));
        assert.ok(result[CANCELED].eqn(0));
        await completeOrder(client_a);
        await completeOrder(client_a);
        await completeOrder(client_a);
        await cancelOrder(client_a);
        result = await contract.getClientOrderCount(client_a);
        assert.ok(result[COMPLETED].eqn(3));
        assert.ok(result[CANCELED].eqn(1));
    });
    
});
