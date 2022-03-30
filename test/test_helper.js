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
        'Ready',       /* order is ready for pickup                            */
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
    const CANCELLED = '1';

    beforeEach(async () => {
        euroContract = await EurTno.deployed();
        contract = await TnoEats.new(euroContract.address);
    });
    
    async function approveOrder(client, seller=seller_a) {
        await euroContract.approve(contract.address, amount, { from: client });
        const result = await contract.placeOrder(seller, "IPFS_LINK", amount, { from: client });
        const orderId =  result.logs[0].args.id.toNumber();
        
        await contract.approveOrder(orderId, SELLER_ZIP, CLIENT_ZIP, deliveryFee, collateral, { from: seller });
        return orderId;
    }
    
    async function acceptOrder(orderId, deliverer=delivery_a) {
        await euroContract.approve(contract.address, collateral, { from: deliverer });
        await contract.acceptOrder(orderId, { from: deliverer });
    }
    
    async function completeOrder(client, seller=seller_a, deliverer=delivery_a) {
        await euroContract.approve(contract.address, amount, { from: client });
        const result = await contract.placeOrder(seller, "IPFS_LINK", amount, { from: client });
        const orderId =  result.logs[0].args.id.toNumber();
        
        await contract.approveOrder(orderId, SELLER_ZIP, CLIENT_ZIP, deliveryFee, collateral, true, { from: seller });
        
        await contract.preparedOrder(orderId, { from: seller });

        await euroContract.approve(contract.address, collateral, { from: deliverer });
        await contract.acceptOrder(orderId, { from: deliverer });

        await contract.transferOrder(orderId, { from: deliverer });
        await contract.transferOrder(orderId, { from: seller });

        await contract.completeOrder(orderId, { from: client });
        await contract.completeOrder(orderId, { from: deliverer });
        return orderId;
    }
    
    async function cancelOrder(client, seller=seller_a) {
        await euroContract.approve(contract.address, amount, { from: client });
        const result = await contract.placeOrder(seller, "IPFS_LINK", amount, { from: client });
        const orderId =  result.logs[0].args.id.toNumber();

        await contract.cancelOrder(orderId, { from: client });
        return orderId;
    }

    it("test getOrdersByClient", async () => {
        {
            let result = await contract.getOrdersByClient(client_a);
            assert.equal(result.length, 0);
        }

        const id0 = await completeOrder(client_a);
        {
            let result = await contract.getOrdersByClient(client_a);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, id0);
        }

        const id1 = await completeOrder(client_b);
        {
            let result = await contract.getOrdersByClient(client_b);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, id1);
        }
            
        const id2 = await cancelOrder(client_a);
        {
            let result = await contract.getOrdersByClient(client_a);
            assert.equal(result.length, 2);
            assert.equal(result[0].id, id0);
            assert.equal(result[1].id, id2);
        }
    });

    it("test getOrdersBySeller", async () => {
        {
            let result = await contract.getOrdersBySeller(seller_a);
            assert.equal(result.length, 0);
        }

        const id0 = await completeOrder(client_a, seller_a);
        {
            let result = await contract.getOrdersBySeller(seller_a);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, id0);
        }
            
        const id1 = await completeOrder(client_a, seller_b);
        {
            let result = await contract.getOrdersBySeller(seller_b);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, id1);
        }
            
        const id2 = await cancelOrder(client_a, seller_a);
        {
            let result = await contract.getOrdersBySeller(seller_a);
            assert.equal(result.length, 2);
            assert.equal(result[0].id, id0);
            assert.equal(result[1].id, id2);
        }
            
        const id3 = await completeOrder(client_b, seller_a);
        {
            let result = await contract.getOrdersBySeller(seller_a);
            assert.equal(result.length, 3);
            assert.equal(result[2].id, id3);
        }
    });

    it("test getOrdersByDeliveryService", async () => {
        {
            let result = await contract.getOrdersByDeliveryService(delivery_a);
            assert.equal(result.length, 0);
        }

        const id0 = await completeOrder(client_a, seller_a, delivery_a);
        {
            let result = await contract.getOrdersByDeliveryService(delivery_a);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, id0);
        }

        const id1 = await completeOrder(client_a, seller_a, delivery_b);
        {
            let result = await contract.getOrdersByDeliveryService(delivery_b);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, id1);
        }
            
        const id2 = await completeOrder(client_b, seller_b, delivery_a);
        {
            let result = await contract.getOrdersByDeliveryService(delivery_a);
            assert.equal(result.length, 2);
            assert.equal(result[1].id, id2);
        }
    });

    it("test getApprovedOrders", async () => {
        {
            let result = await contract.getApprovedOrders();
            assert.equal(result.length, 0, "Approved orders should be empty");
        }
        
        const id0 = await approveOrder(client_a, seller_a);
        {
            let result = await contract.getApprovedOrders();
            assert.equal(result.length, 1, "Approving order should be retrievable");
            assert.equal(result[0].id, id0, "The orderId should be expected");
        }
        
        const id1 = await approveOrder(client_b, seller_b);
        {
            let result = await contract.getApprovedOrders();
            assert.equal(result.length, 2, "Retrieve orders independent of client/seller");
            assert.equal(result[1].id, id1, "The newest order should be appended");
        }

        await acceptOrder(id0, delivery_a);
        {
            let result = await contract.getApprovedOrders();
            assert.equal(result.length, 1), "Accepting order should remove it from the list";
            assert.equal(result[0].id, id1, "Order1 should now be the first order");
        }
    });

    it("test getClientOrderCount", async () => {
        {
            let result = await contract.getClientOrderCount(client_a);
            assert.ok(result[COMPLETED].eqn(0), "Completed order count should start at 0");
            assert.ok(result[CANCELLED].eqn(0), "Cancelled order count should start at 0");
        }

        await completeOrder(client_a);
        await completeOrder(client_a);
        await completeOrder(client_a);
        {
            let result = await contract.getClientOrderCount(client_a);
            assert.ok(result[COMPLETED].eqn(3), "Completing orders should be reflected");
            assert.ok(result[CANCELLED].eqn(0));
        }

        await cancelOrder(client_a);
        {
            let result = await contract.getClientOrderCount(client_a);
            assert.ok(result[COMPLETED].eqn(3));
            assert.ok(result[CANCELLED].eqn(1), "Cancelling orders should be reflected");
        }

        await completeOrder(client_b);
        await cancelOrder(client_b);
        {
            let result = await contract.getClientOrderCount(client_a);
            assert.ok(result[COMPLETED].eqn(3), "Client b shouldn't influence completed orders of client a");
            assert.ok(result[CANCELLED].eqn(1), "Client b shouldn't influence cancelled orders of client a");
        }
    });
    
});
