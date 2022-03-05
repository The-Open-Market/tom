// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";

/**
 * @title Order querying functionality
 * @notice This contract provides functions to access information about orders.
 */
abstract contract OrderHelper is OrderFactory {

  /**
    * @notice Gets all order ids of the client by the provided address.
    * @param _client Order owner address.
    * @return An integer array containing order ids.
    */
  function getOrdersByClient(address _client) external view returns(uint[] memory) {
    uint[] memory orderIds = new uint[](clientOrderCount[_client]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].client == _client) {
        orderIds[counter] = i;
        counter++;
      }
    }
    return orderIds;
  }

  /**
    * @notice Gets all order ids of the seller by the provided address.
    * @param _seller Order owner address.
    * @return An integer array containing order ids.
    */
  function getOrdersBySeller(address _seller) external view returns(uint[] memory) {
    uint[] memory orderIds = new uint[](sellerOrderCount[_seller]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].seller == _seller) {
        orderIds[counter] = i;
        counter++;
      }
    }
    return orderIds;
  }
}