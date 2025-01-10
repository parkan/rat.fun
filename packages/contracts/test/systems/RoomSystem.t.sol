// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { BaseTest } from "../BaseTest.sol";
import "../../src/codegen/index.sol";
import "../../src/libraries/Libraries.sol";
import { ENTITY_TYPE } from "../../src/codegen/common.sol";

contract RoomSystemTest is BaseTest {
  function testCreateRoom() public {
    setUp();

    vm.startPrank(alice);

    startGasReport("Create room");
    bytes32 roomId = world.ratroom__createRoom("A test room");
    endGasReport();

    vm.stopPrank();

    // Check room
    assertEq(uint8(EntityType.get(roomId)), uint8(ENTITY_TYPE.ROOM));
    assertEq(RoomPrompt.get(roomId), "A test room");
  }

  function testLongRoomPrompt() public {
    setUp();

    vm.startPrank(alice);

    startGasReport("Create room: long prompt");
    world.ratroom__createRoom(
      "The room has two doors. One doors lead to death, the other to freedom. If a rat does not make a choice within 10 minutes it is killed and the body removed. Each door has a guardian mouse that needs to be defeated to pass."
    );
    endGasReport();

    vm.stopPrank();
  }
}
