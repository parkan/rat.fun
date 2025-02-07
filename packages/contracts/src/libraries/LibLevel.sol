// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { EntityType, Index, LevelUpCost, RoomCreationCost, LevelList } from "../codegen/index.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";

library LibLevel {
  function createLevel(
    uint256 _index,
    uint256 _levelUpCost,
    uint256 _roomCreationCost
  ) internal returns (bytes32 levelId) {
    levelId = getUniqueEntity();
    EntityType.set(levelId, ENTITY_TYPE.LEVEL);
    
    Index.set(levelId, _index);
    LevelUpCost.set(levelId, _levelUpCost);
    RoomCreationCost.set(levelId, _roomCreationCost);

    // Push to the list of levels
    LevelList.push(levelId);
  }
}
