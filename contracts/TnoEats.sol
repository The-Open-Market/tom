// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// TODO: Add docs
contract TnoEats {
    
    // TODO: Add info for the deliveryService
    event NewOrder(address indexed seller, uint orderId, string orderInfo);
    event ProcessingOrder(uint indexed orderId);
    event CompletedOrder(uint indexed orderId);
    
    struct Order {
        uint id;
        address client;
        address seller;
        address deliveryService;
        OrderStatus status;
        // TODO: Should we store orderInfo (IPFS link) on blockchain or just inside the event to save on gas and storage?
    }

    enum OrderStatus {
        Pending, // client just submitted
        DeliveryReady, // delivery service found
        SellerReady, // seller accepted
        Accepted, // order is correct and being processed
        ClientConfirmed, // client received product
        DeliveryConfirmed, // delivery service confirmed dropping off product
        Completed, // order is sucessfully completed
        Disputed, // dispute from one of the parties
        Canceled // order refunded before reaching Accepted status
    }

    Order[] public orders;

    modifier validOrder(uint _orderId) {
        require(_orderId < orders.length, "Invalid order id!");
        // Orders that have a final status should not be modified
        Order storage currentOrder = orders[_orderId];
        require(
            currentOrder.status != OrderStatus.Completed
            || currentOrder.status != OrderStatus.Canceled
            || currentOrder.status != OrderStatus.Disputed,
            "Order already finalized!"
        );
        _;
    }

    modifier validParticipant(uint _orderId, address party) {
        Order storage currentOrder = orders[_orderId];
        require(
            currentOrder.client == party
            || currentOrder.seller == party
            || currentOrder.deliveryService == party,
            "The sender is not involved in the transaction!"
        );
        _;
    }

    modifier orderNotStarted(uint _orderId) {
        Order storage currentOrder = orders[_orderId];
        require(
            currentOrder.status == OrderStatus.Pending
            || currentOrder.status == OrderStatus.DeliveryReady
            || currentOrder.status == OrderStatus.SellerReady,
            "Order is not waiting to be accepted!"
        );
        _;
    }

    modifier orderProcessing(uint _orderId) {
        Order storage currentOrder = orders[_orderId];
        require(
            currentOrder.status == OrderStatus.Accepted
            || currentOrder.status == OrderStatus.ClientConfirmed
            || currentOrder.status == OrderStatus.DeliveryConfirmed,
            "Order is not currently being processed!"
        );
        _;
    }

    function startOrder(address _seller, string memory _orderInfo) external {
        // TODO: Handle collateral of user and amount of purchase
        // TODO: Check for valid reputation + collateral amount?
        // TODO: Verify crypto to ensure order is correct?
        // TODO: ZIP Codes, distance
        uint id = orders.length;
        orders.push(Order(id, msg.sender, _seller, address(0), OrderStatus.Pending));
        emit NewOrder(_seller, id, _orderInfo);
    }

    // Assume orderId is valid and not started yet
    function _sellerAccept(Order storage _currentOrder) private {
        if (_currentOrder.status == OrderStatus.Pending) {
            _currentOrder.status = OrderStatus.SellerReady;
        } else if (_currentOrder.status == OrderStatus.DeliveryReady) {
            _startOrder(_currentOrder);
        } else {
            revert("Unreachable");
        }
    }

    // Assume orderId is valid and not started yet
    function _deliveryServiceAccept(Order storage _currentOrder, address _deliveryService) private {
        require(_currentOrder.deliveryService == address(0));
        // TODO: Handle collateral for delivery service
        // TODO: Prevent client or seller from picking up the order?
        _currentOrder.deliveryService = _deliveryService;
        // TODO: Delivery service provides IPFS link to his public key and other info? (encrypted with seller key?)
        if (_currentOrder.status == OrderStatus.Pending) {
            _currentOrder.status = OrderStatus.DeliveryReady;
        } else if (_currentOrder.status == OrderStatus.SellerReady) {
            _startOrder(_currentOrder);
        } else {
            revert("Unreachable");
        }
    }

    function _startOrder(Order storage _currentOrder) private {
        // TODO: The seller should communicate the info of the customer to deliver to
        _currentOrder.status = OrderStatus.Accepted;
        emit ProcessingOrder(_currentOrder.id);
    }

    function acceptOrder(uint _orderId) external validOrder(_orderId) orderNotStarted(_orderId) {
        Order storage currentOrder = orders[_orderId];
        if (msg.sender == currentOrder.seller) {
            _sellerAccept(currentOrder);       
        } else {
            _deliveryServiceAccept(currentOrder, msg.sender);
        }
    }

    // Assume orderId is valid and currently processing
    function _clientConfirm(Order storage _currentOrder) private {
        if (_currentOrder.status == OrderStatus.Accepted) {
            _currentOrder.status = OrderStatus.ClientConfirmed;
        } else if (_currentOrder.status == OrderStatus.DeliveryConfirmed) {
            _finalizeOrder(_currentOrder);
        } else {
            revert("Unreachable");
        }
    }

    // Assume orderId is valid and currently processing
    function _deliveryServiceConfirm(Order storage _currentOrder) private {
        if (_currentOrder.status == OrderStatus.Accepted) {
            _currentOrder.status = OrderStatus.DeliveryConfirmed;
        } else if (_currentOrder.status == OrderStatus.ClientConfirmed) {
            _finalizeOrder(_currentOrder);
        } else {
            revert("Unreachable");
        }
    }

    function _finalizeOrder(Order storage _currentOrder) private {
        // TODO: Release funds to seller and collateral to other parties
        // TODO: Change reputation of parties involved
        _currentOrder.status = OrderStatus.Completed;
        emit CompletedOrder(_currentOrder.id);
    }

    function completeOrder(uint _orderId) external validOrder(_orderId) validParticipant(_orderId, msg.sender) orderProcessing(_orderId) {
        // TODO: Verify signatures?
        Order storage currentOrder = orders[_orderId];
        if (msg.sender == currentOrder.client) {
            _clientConfirm(currentOrder);
        } else if (msg.sender == currentOrder.deliveryService) {
            _deliveryServiceConfirm(currentOrder);
        } else {
            revert("Seller is not able to complete the order!");
        }
    }

    function refundOrder(uint _orderId) external validOrder(_orderId) validParticipant(_orderId, msg.sender) orderNotStarted(_orderId) {
        // For now we only allow not confirmed orders to be canceled
        orders[_orderId].status = OrderStatus.Canceled;

        // TODO: Handle disputes with reputation
        // TODO: Return funds
    }

    function disputeOrder(uint _orderId) external validOrder(_orderId) validParticipant(_orderId, msg.sender) {
        // TODO: Handle dispute
        // TODO: Adjust reputation
    }
}