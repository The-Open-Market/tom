// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";

/**
 * @title Order querying functionality
 * @notice This contract provides functions to access information about orders.
 */
abstract contract OrderHelper is OrderFactory {

    /**
     * @notice Gets all order ids of the provided address.
     * @param _owner Order owner address.
     * @return An integer array containing order ids.
     */
    function getOrdersByOwner(address _owner) external view returns(uint[] memory) {
    uint[] memory orderIds = new uint[](clientOrderCount[_owner]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orderToClient[i] == _owner) {
        orderIds[counter] = i;
        counter++;
      }
    }
    return orderIds;
  }
}