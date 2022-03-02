// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";

contract OrderDispute is OrderFactory {

    function disputeOrder(uint _orderId) external orderInProgress(_orderId) validParticipant(_orderId) {
        // TODO: Handle dispute
        // TODO: Adjust reputation
    }
}