// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    function placeOrder(address _seller, string memory _orderInfo, uint _amount) external validAddress(_seller) {
        require(IERC20(eurTnoContract).transferFrom(_msgSender(), address(this), _amount));
        _createOrder(_seller, _orderInfo, _amount);
    }

    /**
     * @notice A seller approves an order.
     *         Can be called only by the seller and the order needs to be pending.
     * @param _orderId Active order id
     */
    function approveOrder(uint _orderId, string memory sellerZipCode, string memory clientZipCode, uint _deliveryFee, uint _collateral, bool _waitOnReady) external orderIsPending(_orderId) senderIsSeller(_orderId) {
        Order storage order = orders[_orderId];
        require(_deliveryFee <= order.amount);
        order.status = OrderStatus.Approved;
        order.originZipCode = sellerZipCode;
        order.destinationZipCode = clientZipCode;
        order.deliveryFee = _deliveryFee;
        order.collateral = _collateral;
        order.waitOnReady = _waitOnReady;
        emit OrderStatusChanged(order.id, order.amount, order.deliveryFee, order.collateral, order.status, order.client, order.seller, order.deliveryService, order.orderContentsUrl, order.originZipCode, order.destinationZipCode, order.waitOnReady);
    }

    /**
     * @notice Delivery service accepts an order.
     *         The order needs to be approved by the seller.
     * @param _orderId Active order id
     */
    function acceptOrder(uint _orderId) external orderIsApproved(_orderId) senderIsNotClientOrSeller(_orderId) {
        Order storage order = orders[_orderId];
        address deliveryService = _msgSender();
        require(IERC20(eurTnoContract).transferFrom(deliveryService, address(this), order.collateral));
        order.deliveryService = deliveryService;
        if (order.waitOnReady) {
            order.status = OrderStatus.Accepted;
        } else {
            order.status = OrderStatus.Ready;
        }
        deliveryServiceOrderCount[deliveryService]++;
        emit OrderStatusChanged(order.id, order.amount, order.deliveryFee, order.collateral, order.status, order.client, order.seller, order.deliveryService, order.orderContentsUrl, order.originZipCode, order.destinationZipCode, order.waitOnReady);
    }

    /**
     * @notice Seller marks order as ready.
     *         The order needs to be accepted by a deliveryService.
     * @param _orderId Active order id
     */
    function preparedOrder(uint _orderId) external orderIsAccepted(_orderId) senderIsSeller(_orderId) {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Ready;
        emit OrderStatusChanged(order.id, order.amount, order.deliveryFee, order.collateral, order.status, order.client, order.seller, order.deliveryService, order.orderContentsUrl, order.originZipCode, order.destinationZipCode, order.waitOnReady);
    }

    /**
     * @notice An order is passed on to the delivery service by the seller.
     *         Can be called only by the seller or the delivery service.
     *         The endpoint needs to be called by both parties to reach the consensus and move the order state to InTransit.
     * @param _orderId Active order id
     */
    function transferOrder(uint _orderId) external orderIsTransferable(_orderId) senderIsProvidingService(_orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        if (sender == order.seller && order.status == OrderStatus.Ready) {
            order.status = OrderStatus.Transferred;
        } else if (sender == order.deliveryService && order.status == OrderStatus.Ready) {
            order.status = OrderStatus.PickedUp;
        } else if (sender == order.seller          && order.status == OrderStatus.PickedUp 
                || sender == order.deliveryService && order.status == OrderStatus.Transferred) {
            order.status = OrderStatus.InTransit;
        } else {
            revert("Illegal operation, cannot set order in transit twice with the same account");
        }
        emit OrderStatusChanged(order.id, order.amount, order.deliveryFee, order.collateral, order.status, order.client, order.seller, order.deliveryService, order.orderContentsUrl, order.originZipCode, order.destinationZipCode, order.waitOnReady);
    }

    /**
     * @notice An order is delivered by the delivery service to the client.
     *         Can be called only by the delivery service or the client.
     *         The endpoint needs to be called by both parties to reach the consensus and move the order state to Completed.
     * @param _orderId Active order id
     */
    function completeOrder(uint _orderId) external orderIsCompletable(_orderId) senderIsClientOrDeliveryService(_orderId) {
        Order storage order = orders[_orderId];
        address sender = _msgSender();
        if (sender == order.client && order.status == OrderStatus.InTransit) {
            order.status = OrderStatus.Received;
        } else if (sender == order.deliveryService && order.status == OrderStatus.InTransit) {
            order.status = OrderStatus.Delivered;
        } else if (sender == order.client          && order.status == OrderStatus.Delivered
                || sender == order.deliveryService && order.status == OrderStatus.Received) {
            order.status = OrderStatus.Completed;
            require(IERC20(eurTnoContract).transfer(order.seller, order.amount - order.deliveryFee));
            require(IERC20(eurTnoContract).transfer(order.deliveryService, order.deliveryFee + order.collateral));
        } else {
            revert("Illegal operation, cannot complete order twice with the same account");
        }
        emit OrderStatusChanged(order.id, order.amount, order.deliveryFee, order.collateral, order.status, order.client, order.seller, order.deliveryService, order.orderContentsUrl, order.originZipCode, order.destinationZipCode, order.waitOnReady);
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
        require(IERC20(eurTnoContract).transfer(order.client, order.amount));
        emit OrderStatusChanged(order.id, order.amount, order.deliveryFee, order.collateral, order.status, order.client, order.seller, order.deliveryService, order.orderContentsUrl, order.originZipCode, order.destinationZipCode, order.waitOnReady);
    }

    /**
     * @notice An order is rejected by the seller.
     *         The order needs to be pending and not yet be accepted by the seller.
     * @param _orderId Pending order id
     */
    function rejectOrder(uint _orderId) external orderIsPending(_orderId) senderIsSeller(_orderId) {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Rejected;
        require(IERC20(eurTnoContract).transfer(order.client, order.amount));
        emit OrderStatusChanged(order.id, order.amount, order.deliveryFee, order.collateral, order.status, order.client, order.seller, order.deliveryService, order.orderContentsUrl, order.originZipCode, order.destinationZipCode, order.waitOnReady);
    }
}