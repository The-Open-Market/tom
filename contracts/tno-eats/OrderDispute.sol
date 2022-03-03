// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";

/**
 * @title Order dispute functionality
 * @notice This contract enables the dispute functionality of an order.
 */
abstract contract OrderDispute is OrderFactory {

    // TODO: Add NatSpec
    function disputeOrder(uint _orderId) external orderInProgress(_orderId) validParticipant(_orderId) {
        // TODO: Handle dispute
        // TODO: Adjust reputation
    }
}