// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

uint256 constant AMOUNT = 2_000_000; // 2M

contract FakeRatERC20 is ERC20, ERC20Burnable {
  constructor(address adminAddress) ERC20("FakeSlopamine", "FAKERAT") {
    // Mint the total supply
    _mint(adminAddress, AMOUNT * 10 ** decimals());
  }
}
