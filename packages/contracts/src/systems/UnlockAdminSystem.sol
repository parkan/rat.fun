// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { MasterKey, ExternalAddressesConfig } from "../codegen/index.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { LibUtils, LibWorld } from "../libraries/Libraries.sol";

contract UnlockAdminSystem is System {
  /**
   * @notice Unlock the admin area at a cost of 500 tokens
   */
  function unlockAdmin() public {
    bytes32 playerId = LibUtils.addressToEntityKey(_msgSender());

    // Check if player already has master key
    require(!MasterKey.get(playerId), "already unlocked");

    // Define the unlock cost (500 tokens)
    uint256 unlockCostWithDecimals = 500 * 10 ** LibWorld.erc20().decimals();

    // Step 1: Deposit 500 tokens from player to pool
    // This requires the player to have approved the GamePool contract
    LibWorld.gamePool().depositTokens(_msgSender(), unlockCostWithDecimals);

    // Step 2: Withdraw 500 tokens from pool to fee address
    LibWorld.gamePool().withdrawTokens(ExternalAddressesConfig.getFeeAddress(), unlockCostWithDecimals);

    // Set master key to true
    MasterKey.set(playerId, true);
  }
}
