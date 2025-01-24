// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { GameConfig, Health, Dead, Traits, Owner, OwnedRat, EntityType, Inventory, LoadOut, Value, Balance } from "../codegen/index.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { LibRoom, LibUtils, LibTrait, LibItem, LibRat } from "../libraries/Libraries.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";

contract RatSystem is System {
  /**
   * @notice Create a rat
   * @return ratId The id of the new rat
   */
  function createRat() public returns (bytes32 ratId) {
    bytes32 playerId = LibUtils.addressToEntityKey(_msgSender());

    bytes32 currentRat = OwnedRat.get(playerId);

    // A player can only have one rat at a time
    require(currentRat == bytes32(0) || Dead.get(currentRat), "already has rat");

    ratId = LibRat.createRat();

    // Set ownership
    OwnedRat.set(playerId, ratId);
    Owner.set(ratId, playerId);
  }
}
