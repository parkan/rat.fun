// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { LibRoom } from "../libraries/Libraries.sol";

contract RoomSystem is System {
  function createRoom(string memory roomPrompt) public returns (bytes32 roomId) {
    roomId = LibRoom.createRoom(roomPrompt);
  }
}
