

// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { BaseTest } from "../BaseTest.sol";
import "../../src/codegen/index.sol";
import "../../src/libraries/Libraries.sol";
import { ENTITY_TYPE } from "../../src/codegen/common.sol";

contract ManagerSystemTest is BaseTest {

    function testRevertNotAllowed() public {
        setUp();

        vm.startPrank(alice);
        world.ratroom__spawn("alice");

        vm.expectRevert("not allowed");
        world.ratroom__addItemToLoadOut(bytes32(0), "test item", 20);

        vm.expectRevert("not allowed");
        world.ratroom__removeItemFromLoadOut(bytes32(0), bytes32(0));

        vm.expectRevert("not allowed");
        world.ratroom__addTraitToRat(bytes32(0), "test trait", 20);

        vm.expectRevert("not allowed");
        world.ratroom__removeTraitFromRat(bytes32(0), bytes32(0));

        vm.expectRevert("not allowed");
        world.ratroom__increaseBalance(bytes32(0), 20);

        vm.expectRevert("not allowed");
        world.ratroom__decreaseBalance(bytes32(0), 20);

        vm.expectRevert("not allowed");
        world.ratroom__increaseHealth(bytes32(0), 20);

        vm.expectRevert("not allowed");
        world.ratroom__decreaseHealth(bytes32(0), 20);

        vm.stopPrank();
    }

    function testAddItemToLoadOut() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        startGasReport("Add item to load out");
        bytes32 itemId = world.ratroom__addItemToLoadOut(ratId, "test item", 20);
        endGasReport();
        vm.stopPrank();

        // Check item
        assertEq(uint8(EntityType.get(itemId)), uint8(ENTITY_TYPE.ITEM));
        assertEq(Name.get(itemId), "test item");
        assertEq(Value.get(itemId), 20);

        // Check rat's load out
        bytes32[] memory loadOut = LoadOut.get(ratId);
        assertEq(loadOut.length, 1);
        assertEq(loadOut[0], itemId);
    }

    function testRemoveItemFromLoadOut() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        bytes32 itemId = world.ratroom__addItemToLoadOut(ratId, "test item", 20);
        startGasReport("Remove item from load out");
        world.ratroom__removeItemFromLoadOut(ratId, itemId);
        endGasReport();
        vm.stopPrank();

        // Item should be destroyed
        assertEq(uint8(EntityType.get(itemId)), uint8(ENTITY_TYPE.NONE));
        assertEq(Name.get(itemId), "");
        assertEq(Value.get(itemId), 0);

        // Check rat's load out
        bytes32[] memory loadOut = LoadOut.get(ratId);
        assertEq(loadOut.length, 0);
    }

    function testAddTraitToRat() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        startGasReport("Add trait to rat");
        bytes32 traitId = world.ratroom__addTraitToRat(ratId, "hungry", 20);
        endGasReport();
        vm.stopPrank();

        // Check trait
        assertEq(uint8(EntityType.get(traitId)), uint8(ENTITY_TYPE.TRAIT));
        assertTrue(LibUtils.stringEq(Name.get(traitId), "hungry"));
        assertEq(Value.get(traitId), 20);

        bytes32[] memory traits = Traits.get(ratId);
        assertEq(traits.length, 1);
        assertEq(traits[0], traitId);
    }

    function testRemoveTraitFromRat() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();

        bytes32 traitId = world.ratroom__addTraitToRat(ratId, "hungry", 20);

        // Check that trait was added
        assertEq(uint8(EntityType.get(traitId)), uint8(ENTITY_TYPE.TRAIT));
        assertTrue(LibUtils.stringEq(Name.get(traitId), "hungry"));
        assertEq(Value.get(traitId), 20);
        assertEq(Traits.get(ratId).length, 1);

        startGasReport("Remove trait from rat");
        world.ratroom__removeTraitFromRat(ratId, traitId);
        endGasReport();

        vm.stopPrank();

        // Check that trait was removed
        assertEq(uint8(EntityType.get(traitId)), uint8(ENTITY_TYPE.NONE));
        assertTrue(LibUtils.stringEq(Name.get(traitId), ""));
        assertEq(Value.get(traitId), 0);
        assertEq(Traits.get(ratId).length, 0);
    }

    function testIncreaseBalance() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        startGasReport("Increase balance");
        world.ratroom__increaseBalance(ratId, 20);
        endGasReport();
        vm.stopPrank();

        assertEq(Balance.get(ratId), 20);
    }

    function testDecreaseBalance() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        world.ratroom__increaseBalance(ratId, 20);

        assertEq(Balance.get(ratId), 20);

        startGasReport("Decrease balance");
        world.ratroom__decreaseBalance(ratId, 10);
        endGasReport();
        vm.stopPrank();

        assertEq(Balance.get(ratId), 10);
    }

    function testIncreaseHealth() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        startGasReport("Increase health");
        world.ratroom__increaseHealth(ratId, 20);
        endGasReport();
        vm.stopPrank();

        assertEq(Health.get(ratId), 120);
    }

    function testDecreaseHealth() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        startGasReport("Decrease health");
        world.ratroom__decreaseHealth(ratId, 20);
        endGasReport();
        vm.stopPrank();

        assertEq(Health.get(ratId), 80);
    }

    function testKillRat() public {
        setUp();

        // As player
        vm.startPrank(alice);
        world.ratroom__spawn("alice");
        bytes32 ratId = world.ratroom__createRat();
        vm.stopPrank();

        // As admin
        prankAdmin();
        world.ratroom__decreaseHealth(ratId, 200);
        vm.stopPrank();

        assertEq(Health.get(ratId), 0);
        assertTrue(Dead.get(ratId));
    }
}


