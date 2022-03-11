// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EurTno is ERC20 {
    constructor(uint256 initialSupply) ERC20("Euro TNO", "EURT") {
        _mint(msg.sender, initialSupply);
    }
}