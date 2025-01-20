// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { EntityType, RoomPrompt, Owner, RoomIndex, GameConfig, Balance } from "../codegen/index.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";
import { ROOM_CREATION_COST } from "../constants.sol";

library LibRoom {
  /**
   * @notice Create a room
   * @param _roomPrompt The prompt for the room
   * @return roomId The id of the new room
   */
  function createRoom(string memory _roomPrompt) internal returns (bytes32 roomId) {
    roomId = getUniqueEntity();
    EntityType.set(roomId, ENTITY_TYPE.ROOM);
    RoomPrompt.set(roomId, _roomPrompt);

    uint32 newRoomIndex = GameConfig.getGlobalRoomIndex() + 1;
    GameConfig.setGlobalRoomIndex(newRoomIndex);
    RoomIndex.set(roomId, newRoomIndex);

    // Add to room's balance
    Balance.set(roomId, ROOM_CREATION_COST);
  }
}
