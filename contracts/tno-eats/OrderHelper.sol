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
    * @return uint[] An integer array containing order ids.
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
    * @param _seller Order seller address.
    * @return uint[] An integer array containing order ids.
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

  /**
   * @notice Gets all order ids of the delivery service by the provided address.
   * @param _deliveryService Order deliverer address.
   * @return uint[] An integer array containing order ids.
   */
  function getOrdersByDeliveryService(address _deliveryService) external view returns(uint[] memory) {
    uint[] memory orderIds = new uint[](deliveryServiceOrderCount[_deliveryService]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].deliveryService == _deliveryService) {
        orderIds[counter] = i;
        counter++;
      }
    }
    return orderIds;
  }

  function getOrdersInProgressByDeliveryService(address _deliveryService) external view returns(Order[] memory) {
    Order[] memory orderIds = new Order[](deliveryServiceOrderCount[_deliveryService]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (orders[i].deliveryService == _deliveryService 
      && (orders[i].status == OrderStatus.Accepted 
      || orders[i].status == OrderStatus.PickedUp
      || orders[i].status == OrderStatus.Transferred
      || orders[i].status == OrderStatus.InTransit
      || orders[i].status == OrderStatus.Received
      || orders[i].status == OrderStatus.Delivered)) {
        orderIds[counter] = orders[i];
        counter++;
      }
    }
    return orderIds;
  }
}