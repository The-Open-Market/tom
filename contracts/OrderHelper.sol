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
    * @param _client Order client address.
    * @return Order[] An array containing orders.
    */
  function getOrdersByClient(address _client) external view returns(Order[] memory) {
    Order[] memory result = new Order[](clientOrderCount[_client]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].client == _client) {
        result[counter] = orders[i];
        counter++;
      }
    }
    return result;
  }

  /**
    * @notice Gets all order ids of the seller by the provided address.
    * @param _seller Order seller address.
    * @return Order[] An array containing orders.
    */
  function getOrdersBySeller(address _seller) external view returns(Order[] memory) {
    Order[] memory result = new Order[](sellerOrderCount[_seller]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].seller == _seller) {
        result[counter] = orders[i];
        counter++;
      }
    }
    return result;
  }

  /**
   * @notice Gets all order ids of the delivery service by the provided address.
   * @param _deliveryService Order deliverer address.
   * @return Order[] An array containing orders.
   */
  function getOrdersByDeliveryService(address _deliveryService) external view returns(Order[] memory) {
    Order[] memory result = new Order[](deliveryServiceOrderCount[_deliveryService]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].deliveryService == _deliveryService) {
        result[counter] = orders[i];
        counter++;
      }
    }
    return result;
  }

  function getApprovedOrders() external view returns(Order[] memory) {
    uint total = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].status == OrderStatus.Approved) {
        total++;
      }
    }
    Order[] memory result = new Order[](total);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].status == OrderStatus.Approved) {
        result[counter] = orders[i];
        counter++;
      }
    }
    return result;
  }

  function getClientOrderCount(address _client) external view returns(uint, uint) {
    uint completedCount = 0;
    uint cancelledCount = 0;

    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].status == OrderStatus.Completed && orders[i].client == _client) {
        completedCount++;
      } else if (orders[i].status == OrderStatus.Cancelled && orders[i].client == _client) {
        cancelledCount++;
      }
    }

    return (completedCount, cancelledCount);
  }
}