// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { EntityType, RoomPrompt, Owner, RoomIndex, GameConfig } from "../codegen/index.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";

library LibRoom {
  function createRoom(string memory roomPrompt) internal returns (bytes32 roomId) {
    roomId = getUniqueEntity();
    EntityType.set(roomId, ENTITY_TYPE.ROOM);
    RoomPrompt.set(roomId, roomPrompt);

    uint32 newRoomIndex = GameConfig.getGlobalRoomIndex() + 1;
    GameConfig.setGlobalRoomIndex(newRoomIndex);
    RoomIndex.set(roomId, newRoomIndex);
  }
}
