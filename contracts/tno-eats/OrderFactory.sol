// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TnoEats.sol";

// TODO: Add docs
contract OrderFactory is TnoEats {
    
    // TODO: Add info for the deliveryService
    event OrderIsPlaced(address indexed seller, uint orderId, string orderContentsUrl);
    event DeliveryServiceAssigned(address indexed deliveryService, uint orderId);
    event OrderIsProcessing(uint indexed orderId);
    event OrderIsInTransit(uint indexed orderId);
    event OrderIsCompleted(uint indexed orderId);
    event OrderIsCancelled(uint indexed orderId);
    
    struct Order {
        OrderStatus status;
        address client;
        address seller;
        address deliveryService;
    }

    enum OrderStatus {
        Pending,     /* order is submitted by a client                       */
        Accepted,    /* order is accepted by a delivery service              */
        Processing,  /* order is being processed by a seller                 */
        PickedUp,    /* order is picked up by a delivery service             */
        Transferred, /* order is transferred by a seller to delivery service */
        InTransit,   /* order is being delivered by the delivery service     */
        Received,    /* order is received by a client                        */
        Delivered,   /* order is delivered by a delivery service             */
        Completed,   /* order is sucessfully completed                       */
        Disputed,    /* order is disputed by one of the parties              */
        Canceled     /* order is cancelled before reaching Processing status */
    }

    Order[] public orders;

    mapping (uint => address) public orderToClient;
    mapping (address => uint) clientOrderCount;

    modifier activeOrder(uint _orderId) {
        require(_orderId < orders.length, "Invalid order id");
        Order storage order = orders[_orderId];
        require(
               order.status != OrderStatus.Completed
            || order.status != OrderStatus.Canceled
            || order.status != OrderStatus.Disputed,
            "Order is inactive"
        );
        _;
    }

    modifier senderIsSeller(uint _orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        require(
            sender == order.seller,
            "The sender is not the seller"
        );
        _;
    }

    modifier senderIsClient(uint _orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        require(
            sender == order.client,
            "The sender is not the client"
        );
        _;
    }

    modifier senderIsProvidingService(uint _orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        require(
               sender == order.seller
            || sender == order.deliveryService,
            "The sender is neither the seller nor delivery service"
        );
        _;
    }

    // TODO: find better name
    modifier senderIsClientOrDeliveryService(uint _orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        require(
               sender == order.client
            || sender == order.deliveryService,
            "The sender is neither the seller nor delivery service"
        );
        _;
    }

    modifier validParticipant(uint _orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        require(
               sender == order.client
            || sender == order.seller
            || sender == order.deliveryService,
            "The sender is not involved in the transaction"
        );
        _;
    }

    modifier orderIsCancelable(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
               order.status == OrderStatus.Pending
            || order.status == OrderStatus.Accepted,
            "Order is already being prepared"
        );
        _;
    }

    modifier orderPending(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Pending,
            "Order is already accepted"
        );
        _;
    }

    modifier orderAccepted(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Accepted,
            "Order is still pending or in progress"
        );
        _;
    }

    modifier orderIsTransferable(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
               order.status == OrderStatus.Processing
            || order.status == OrderStatus.Transferred
            || order.status == OrderStatus.PickedUp,
            "Order is is not in transferable"
        );
        _;
    }

    modifier orderIsCompletable(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
               order.status == OrderStatus.InTransit
            || order.status == OrderStatus.Received
            || order.status == OrderStatus.Delivered,
            "Order is is not in completable"
        );
        _;
    }

    modifier orderInProgress(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
               order.status == OrderStatus.Processing
            || order.status == OrderStatus.PickedUp
            || order.status == OrderStatus.Transferred
            || order.status == OrderStatus.InTransit
            || order.status == OrderStatus.Received
            || order.status == OrderStatus.Delivered,
            "Order is in progress"
        );
        _;
    }

    function _createOrder(address _seller, string memory _orderInfo) internal {
        address client = _msgSender();
        orders.push(Order(OrderStatus.Pending, client, _seller, address(0)));
        uint id = orders.length - 1;
        orderToClient[id] = client;
        clientOrderCount[client]++;
        emit OrderIsPlaced(_seller, id, _orderInfo);
    }
}