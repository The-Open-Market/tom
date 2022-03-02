// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";

//TODO: add docs
contract OrderManager is OrderFactory {

    // TODO: ZIP Codes, distance
    function placeOrder(address _seller, string memory _orderInfo) external {
        // TODO: Handle collateral of user and amount of purchase
        // TODO: Check for valid reputation + collateral amount
        _createOrder(_seller, _orderInfo);
    }

    function assignDeliveryService(uint _orderId) external activeOrder(_orderId) orderPending(_orderId) {
        Order storage order = orders[_orderId];
        order.deliveryService = _msgSender();
        // TODO: Check for valid reputation + collateral amount
        order.status = OrderStatus.Accepted;
        emit DeliveryServiceAssigned(order.deliveryService, _orderId);
    }

    function startProcessing(uint _orderId) external activeOrder(_orderId) orderAccepted(_orderId) senderIsSeller(_orderId) {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Processing;
        emit OrderIsProcessing(_orderId);
    }

    function transferOrder(uint _orderId) external activeOrder(_orderId) orderIsTransferable(_orderId) senderIsProvidingService(_orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        if (sender == order.seller && order.status == OrderStatus.Processing) {
            order.status = OrderStatus.Transferred;
        } else if (sender == order.deliveryService && order.status == OrderStatus.Processing) {
            order.status = OrderStatus.PickedUp;
        } else {
            order.status = OrderStatus.InTransit;
            emit OrderIsInTransit(_orderId);
        }
    }

    function completeOrder(uint _orderId) external activeOrder(_orderId) orderIsCompletable(_orderId) senderIsClientOrDeliveryService(_orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        if (sender == order.client && order.status == OrderStatus.InTransit) {
            order.status = OrderStatus.Received;
        } else if (sender == order.deliveryService && order.status == OrderStatus.InTransit) {
            order.status = OrderStatus.Delivered;
        } else {
            order.status = OrderStatus.Completed;
            emit OrderIsCompleted(_orderId);
        }
    }

    function cancelOrder(uint _orderId) external activeOrder(_orderId) orderIsCancelable(_orderId) senderIsClient(_orderId) {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Canceled;
        // TODO: Return funds and delivery service collateral if applicable
        emit OrderIsCancelled(_orderId);
    }
}