// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Order creation functionality, events, and modifiers
 * @notice This contract holds orders and allows to create new orders.
 */
abstract contract OrderFactory is Ownable {

    event OrderStatusChanged(
        uint id,
        uint amount,
        uint deliveryFee,
        uint collateral,
        OrderStatus status,
        address indexed client,
        address indexed seller,
        address indexed deliveryService,
        string orderContentsUrl,
        string originZipCode,
        string destinationZipCode,
        bool waitOnReady
    );
    event ApprovedOrder(
        uint id,
        uint amount,
        uint deliveryFee,
        uint collateral,
        OrderStatus indexed status,
        address client,
        address seller,
        address deliveryService,
        string orderContentsUrl,
        string originZipCode,
        string destinationZipCode,
        bool waitOnReady
    );

    struct Order {
        uint id;
        uint amount;
        uint deliveryFee;
        uint collateral;
        OrderStatus status;
        address client;
        address seller;
        address deliveryService;
        string orderContentsUrl;
        string originZipCode;
        string destinationZipCode;
        bool waitOnReady;
    }

    enum OrderStatus {
        Pending,     /* 0  order is submitted by a client                       */
        Approved,    /* 1  order is approved by a seller                        */
        Accepted,    /* 2  (optional) order is accepted by a delivery service   */
        Ready,       /* 3  order is ready for pickup                            */
        PickedUp,    /* 4  order is picked up by a delivery service             */
        Transferred, /* 5  order is transferred by a seller to delivery service */
        InTransit,   /* 6  order is being delivered by the delivery service     */
        Received,    /* 7  order is received by a client                        */
        Delivered,   /* 8  order is delivered by a delivery service             */
        Completed,   /* 9  order is sucessfully completed                       */
        Cancelled,   /* 10 order is cancelled before reaching Processing status */
        Rejected     /* 11  order is rejected by a seller                       */
    }

    Order[] public orders;

    mapping (address => uint) clientOrderCount;
    mapping (address => uint) sellerOrderCount;
    mapping (address => uint) deliveryServiceOrderCount;

    address public eurTnoContract;

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
            && sender != order.seller,
            "The sender is client or seller"
        );
        _;
    }

    modifier orderIsPending(uint _orderId) {
        require(
            _orderId < orders.length
            && orders[_orderId].status == OrderStatus.Pending,
            "Order is already accepted"
        );
        _;
    }

    modifier orderIsApproved(uint _orderId) {
        require(
            _orderId < orders.length
            && orders[_orderId].status == OrderStatus.Approved,
            "Order is still pending or in progress"
        );
        _;
    }

    modifier orderIsAccepted(uint _orderId) {
        require(
            _orderId < orders.length
            && orders[_orderId].status == OrderStatus.Accepted,
            "Order is not accepted"
        );
        _;
    }

    modifier orderIsTransferable(uint _orderId) {
        require(_orderId < orders.length, "Invalid order id");
        Order storage order = orders[_orderId];
        require(
               order.status == OrderStatus.Ready
            || order.status == OrderStatus.Transferred
            || order.status == OrderStatus.PickedUp,
            "Order is is not in transferable"
        );
        _;
    }

    modifier orderIsCompletable(uint _orderId) {
        require(_orderId < orders.length, "Invalid order id");
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
        require(
            _orderId < orders.length
            && orders[_orderId].status == OrderStatus.Pending,
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
    function _createOrder(address _seller, string memory _orderInfo, uint _amount) internal {
        address client = _msgSender();
        uint id = orders.length;
        orders.push(Order(id, _amount, 0, 0, OrderStatus.Pending, client, _seller, address(0), _orderInfo, "", "", true));
        clientOrderCount[client]++;
        sellerOrderCount[_seller]++;
        emit OrderStatusChanged(id, _amount, 0, 0, OrderStatus.Pending, client, _seller, address(0), _orderInfo, "", "", true);
    }
}