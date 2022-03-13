// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Order creation functionality, events, and modifiers
 * @notice This contract holds orders and allows to create new orders.
 */
abstract contract OrderFactory is Ownable {
    
    // TODO: Add info for the deliveryService
    event OrderPending(uint id, address indexed client, address indexed seller, string orderContentsUrl);
    event OrderApproved(uint id, address indexed client, address indexed seller, string sellerZipCode, string clientZipCode);
    event OrderRejected(uint id, address indexed client, address indexed seller);
    event OrderAccepted(uint id, address indexed client, address indexed seller, address indexed deliveryService);
    event OrderPickedUp(uint id, address indexed client, address indexed seller, address indexed deliveryService);
    event OrderTransferred(uint id, address indexed client, address indexed seller, address indexed deliveryService);
    event OrderInTransit(uint id, address indexed client, address indexed seller, address indexed deliveryService);
    event OrderDelivered(uint id, address indexed client, address indexed seller, address indexed deliveryService);
    event OrderReceived(uint id, address indexed client, address indexed seller, address indexed deliveryService);
    event OrderCompleted(uint id, address indexed client, address indexed seller, address indexed deliveryService);
    event OrderCancelled(uint id, address indexed client, address indexed seller);
    
    struct Order {
        uint id;
        OrderStatus status;
        address client;
        address seller;
        address deliveryService;
        string orderContentsUrl;
        string originZipCode;
        string destinationZipCode;
    }

    enum OrderStatus {
        Pending,     /* 0  order is submitted by a client                       */
        Approved,    /* 1  order is approved by a seller                        */
        Rejected,    /* 2  order is rejected by a seller                        */
        Accepted,    /* 3  order is accepted by a delivery service              */
        PickedUp,    /* 4  order is picked up by a delivery service             */
        Transferred, /* 5  order is transferred by a seller to delivery service */
        InTransit,   /* 6  order is being delivered by the delivery service     */
        Received,    /* 7  order is received by a client                        */
        Delivered,   /* 8  order is delivered by a delivery service             */
        Completed,   /* 9  order is sucessfully completed                       */
        Disputed,    /* 10 order is disputed by one of the parties              */
        Cancelled     /* 11 order is cancelled before reaching Processing status */
    }

    Order[] public orders;

    mapping (address => uint) clientOrderCount;
    mapping (address => uint) sellerOrderCount;
    mapping (address => uint) deliveryServiceOrderCount;

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

    modifier senderIsNotClientOrSeller(uint _orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        require(
               sender != order.client
            || sender != order.seller,
            "The sender is client or seller"
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

    modifier orderIsActive(uint _orderId) {
        require(_orderId < orders.length, "Invalid order id");
        Order storage order = orders[_orderId];
        require(
               order.status != OrderStatus.Completed
            || order.status != OrderStatus.Cancelled
            || order.status != OrderStatus.Disputed,
            "Order is inactive"
        );
        _;
    }

    modifier orderInProgress(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
               order.status == OrderStatus.Approved
            || order.status == OrderStatus.Accepted
            || order.status == OrderStatus.PickedUp
            || order.status == OrderStatus.Transferred
            || order.status == OrderStatus.InTransit
            || order.status == OrderStatus.Received
            || order.status == OrderStatus.Delivered,
            "Order is in progress"
        );
        _;
    }

    modifier orderIsPending(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Pending,
            "Order is already accepted"
        );
        _;
    }

    modifier orderIsApproved(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Approved,
            "Order is still pending or in progress"
        );
        _;
    }

    modifier orderIsTransferable(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
               order.status == OrderStatus.Accepted
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

    modifier orderIsCancelable(uint _orderId) {
        Order storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Pending,
            "Order is already being prepared"
        );
        _;
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0), "Null address is not valid!");
        _;
    }

    /**
     * @notice Creates new order and emits an event to signal about new order.
     * @param _seller The address of the seller
     * @param _orderInfo Url to the encoded order data stored in IPFS
     */
    function _createOrder(address _seller, string memory _orderInfo) internal {
        address client = _msgSender();
        uint id = orders.length;
        orders.push(Order(id, OrderStatus.Pending, client, _seller, address(0), "", "", ""));
        clientOrderCount[client]++;
        sellerOrderCount[_seller]++;
        emit OrderPending(id, client, _seller, _orderInfo);
    }
}