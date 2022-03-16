// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";

/**
 * @title Order managing functionality
 * @notice This contract allows to manage orders and move them through different states.
 */
abstract contract OrderManager is OrderFactory {

    /**
     * @notice A client places an order to the smart contract.
     * @param _seller The address of the seller
     * @param _orderInfo Url to the encoded order data stored in IPFS
     */
    function placeOrder(address _seller, string memory _orderInfo) external validAddress(_seller) {
        // TODO: ZIP Codes, distance
        // TODO: Handle collateral of user and amount of purchase
        // TODO: Check for valid reputation + collateral amount
        _createOrder(_seller, _orderInfo);
    }

    /**
     * @notice A seller approves an order.
     *         Can be called only by the seller and the order needs to be pending.
     * @param _orderId Active order id
     */
    function approveOrder(uint _orderId, string memory sellerZipCode, string memory clientZipCode) external orderIsActive(_orderId) orderIsPending(_orderId) senderIsSeller(_orderId) {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Approved;
        order.originZipCode = sellerZipCode;
        order.destinationZipCode = clientZipCode;
        emit OrderApproved(_orderId, order.client, order.seller, sellerZipCode, clientZipCode, order.orderContentsUrl);
    }

    /**
     * @notice Delivery service accepts an order.
     *         The order needs to be approved by the seller.
     * @param _orderId Active order id
     */
    function acceptOrder(uint _orderId) external orderIsActive(_orderId) orderIsApproved(_orderId) senderIsNotClientOrSeller(_orderId) {
        Order storage order = orders[_orderId];
        // TODO: Check for valid reputation + collateral amount
        address deliveryService = _msgSender();
        order.deliveryService = deliveryService;
        order.status = OrderStatus.Accepted;
        deliveryServiceOrderCount[deliveryService]++;
        emit OrderAccepted(_orderId, order.client, order.seller, deliveryService);
    }

    /**
     * @notice An order is passed on to the delivery service by the seller.
     *         Can be called only by the seller or the delivery service.
     *         The endpoint needs to be called by both parties to reach the consensus and move the order state to InTransit.
     * @param _orderId Active order id
     */
    function transferOrder(uint _orderId) external orderIsActive(_orderId) orderIsTransferable(_orderId) senderIsProvidingService(_orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        if (sender == order.seller && order.status == OrderStatus.Accepted) {
            order.status = OrderStatus.Transferred;
            emit OrderTransferred(_orderId, order.client, order.seller, order.deliveryService);
        } else if (sender == order.deliveryService && order.status == OrderStatus.Accepted) {
            order.status = OrderStatus.PickedUp;
            emit OrderPickedUp(_orderId, order.client, order.seller, order.deliveryService);
        } else if (sender == order.seller          && order.status == OrderStatus.PickedUp 
                || sender == order.deliveryService && order.status == OrderStatus.Transferred) {
            order.status = OrderStatus.InTransit;
            emit OrderInTransit(_orderId, order.client, order.seller, order.deliveryService);
        } else {
            revert("Illegal operation, cannot set order in transit twice with the same account");
        }
    }

    /**
     * @notice An order is delivered by the delivery service to the client.
     *         Can be called only by the delivery service or the client.
     *         The endpoint needs to be called by both parties to reach the consensus and move the order state to Completed.
     * @param _orderId Active order id
     */
    function completeOrder(uint _orderId) external orderIsActive(_orderId) orderIsCompletable(_orderId) senderIsClientOrDeliveryService(_orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        if (sender == order.client && order.status == OrderStatus.InTransit) {
            order.status = OrderStatus.Received;
            emit OrderReceived(_orderId, order.client, order.seller, order.deliveryService);
        } else if (sender == order.deliveryService && order.status == OrderStatus.InTransit) {
            order.status = OrderStatus.Delivered;
            emit OrderDelivered(_orderId, order.client, order.seller, order.deliveryService);
        } else if (sender == order.client          && order.status == OrderStatus.Delivered
                || sender == order.deliveryService && order.status == OrderStatus.Received) {
            order.status = OrderStatus.Completed;
            emit OrderCompleted(_orderId, order.client, order.seller, order.deliveryService);
        } else {
            revert("Illegal operation, cannot complete order twice with the same account");
        }
    }

    /**
     * @notice An order is cancelled by the client.
     *         Can be called only by the client.
     *         The order needs to be pending and not yet accepted by the seller.
     * @param _orderId Active order id
     */
    function cancelOrder(uint _orderId) external orderIsCancelable(_orderId) senderIsClient(_orderId) {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Cancelled;
        // TODO: Return funds and delivery service collateral if applicable
        emit OrderCancelled(_orderId, order.client, order.seller);
    }

    /**
     * @notice An order is rejected by the seller.
     *         The order needs to be pending and not yet be accepted by the seller.
     * @param _orderId Pending order id
     */
    function rejectOrder(uint _orderId) external orderIsPending(_orderId) senderIsSeller(_orderId) {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Rejected;

        // TODO: Return funds to client
        emit OrderRejected(_orderId, order.client, order.seller);
    }
}