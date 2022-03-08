// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/Ownable.sol";

/**
 * @title Order creation functionality, events, and modifiers
 * @notice This contract holds orders and allows to create new orders.
 */
abstract contract OrderFactory is Ownable {
    
    // TODO: Add info for the deliveryService
    event OrderPlaced(address indexed seller, uint orderId, string orderContentsUrl);
    event OrderApproved(uint indexed orderId);
    event OrderRejected(uint indexed orderId);
    event OrderAccepted(address indexed deliveryService, uint orderId);
    event OrderInTransit(uint indexed orderId);
    event OrderCompleted(uint indexed orderId);
    event OrderCancelled(uint indexed orderId);
    
    struct Order {
        OrderStatus status;
        address client;
        address seller;
        address deliveryService;
    }

    enum OrderStatus {
        Pending,     /* order is submitted by a client                       */
        Approved,    /* order is approved by a seller                        */
        Rejected,    /* order is rejected by a seller                        */
        Accepted,    /* order is accepted by a delivery service              */
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

    mapping (address => uint) clientOrderCount;
    mapping (address => uint) sellerOrderCount;

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
            || order.status != OrderStatus.Canceled
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
        orders.push(Order(OrderStatus.Pending, client, _seller, address(0)));
        uint id = orders.length - 1;
        clientOrderCount[client]++;
        sellerOrderCount[_seller]++;
        emit OrderPlaced(_seller, id, _orderInfo);
    }
}