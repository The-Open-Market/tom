// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrderHelper.sol";
import "./OrderManager.sol";

/**
 * @title Main contract that contains all functionality of the smart contract
 * @notice This contract combines all the possible functionality of the smart contract.
 */
contract TnoEats is OrderHelper, OrderManager {

    constructor(address _eurTnoContract) {
        eurTnoContract = _eurTnoContract;
    }

    function changeEurTnoAddress(address _eurTnoContract) external onlyOwner validAddress(_eurTnoContract) {
        eurTnoContract = _eurTnoContract;
    }
}