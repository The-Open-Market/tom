// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderFactory.sol";

//TODO: add docs
contract OrderHelper is OrderFactory {

    //TODO: add docs
    function getOrdersByOwner(address _owner) external view returns(uint[] memory) {
    uint[] memory orderIds = new uint[](clientOrderCount[_owner]);
    uint counter = 0;
    for (uint i = 0; i < orders.length; i++) {
      if (clientOrderCount[i] == _owner) {
        orderIds[counter] = i;
        counter++;
      }
    }
    return orderIds;
  }
}