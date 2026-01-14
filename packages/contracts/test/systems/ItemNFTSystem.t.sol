// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { BaseTest } from "../BaseTest.sol";
import "../../src/codegen/index.sol";
import "../../src/libraries/Libraries.sol";
import { Item } from "../../src/structs.sol";
import { ItemNFT } from "../../src/external/ItemNFT.sol";

contract ItemNFTSystemTest is BaseTest {
  bytes32 aliceId;
  bytes32 bobId;
  bytes32 ratId;
  bytes32 tripId;
  bytes32 itemId;

  function setUp() public override {
    super.setUp();

    // Setup alice with a rat
    setInitialBalance(alice);
    vm.startPrank(alice);
    aliceId = world.ratfun__spawn("alice");
    approveGamePool(type(uint256).max);
    ratId = world.ratfun__createRat("roger");
    vm.stopPrank();

    // Setup bob with a trip (needed for applyOutcome)
    setInitialBalance(bob);
    vm.startPrank(bob);
    bobId = world.ratfun__spawn("bob");
    approveGamePool(type(uint256).max);
    vm.stopPrank();

    // Create a trip as admin
    prankAdmin();
    tripId = world.ratfun__createTrip(bobId, bytes32(0), TRIP_INITIAL_BALANCE, false, 0, 0, "test trip");

    // Give the rat an item via applyOutcome
    Item[] memory items = new Item[](1);
    items[0] = Item({ name: "Test Sword", value: 50 });
    world.ratfun__applyOutcome(ratId, tripId, 0, new bytes32[](0), items);
    vm.stopPrank();

    // Get the item ID from inventory
    bytes32[] memory inventory = Inventory.get(ratId);
    itemId = inventory[0];
  }

  function testExportItemToNFT() public {
    vm.startPrank(alice);

    // Check initial state
    assertEq(Inventory.length(ratId), 1);

    // Export item
    uint256 tokenId = world.ratfun__exportItemToNFT(ratId, itemId);

    vm.stopPrank();

    // Check item removed from inventory
    assertEq(Inventory.length(ratId), 0);

    // Check NFT minted
    ItemNFT nft = LibWorld.itemNFT();
    assertEq(nft.ownerOf(tokenId), alice);
    assertEq(nft.balanceOf(alice), 1);

    // Check NFT data
    assertEq(nft.itemIds(tokenId), itemId);
    (string memory name, uint256 value) = nft.getItemData(tokenId);
    assertEq(name, "Test Sword");
    assertEq(value, 50);
  }

  function testImportNFTToItem() public {
    vm.startPrank(alice);

    // First export
    uint256 tokenId = world.ratfun__exportItemToNFT(ratId, itemId);

    // Then import
    bytes32 returnedItemId = world.ratfun__importNFTToItem(ratId, tokenId);

    vm.stopPrank();

    // Check same item ID returned
    assertEq(returnedItemId, itemId);

    // Check item back in inventory
    assertEq(Inventory.length(ratId), 1);
    assertEq(Inventory.getItem(ratId, 0), itemId);

    // Check NFT burned
    ItemNFT nft = LibWorld.itemNFT();
    assertEq(nft.balanceOf(alice), 0);
  }

  function testExportRevertNotYourRat() public {
    vm.startPrank(bob);

    vm.expectRevert("not your rat");
    world.ratfun__exportItemToNFT(ratId, itemId);

    vm.stopPrank();
  }

  function testExportRevertRatIsDead() public {
    vm.startPrank(alice);

    // Kill the rat
    world.ratfun__liquidateRat();

    vm.expectRevert("rat is dead");
    world.ratfun__exportItemToNFT(ratId, itemId);

    vm.stopPrank();
  }

  function testExportRevertItemNotInInventory() public {
    vm.startPrank(alice);

    bytes32 fakeItemId = bytes32(uint256(12345));

    vm.expectRevert("item not in inventory");
    world.ratfun__exportItemToNFT(ratId, fakeItemId);

    vm.stopPrank();
  }

  function testImportRevertNotYourRat() public {
    vm.startPrank(alice);
    uint256 tokenId = world.ratfun__exportItemToNFT(ratId, itemId);
    vm.stopPrank();

    // Bob tries to import to alice's rat
    vm.startPrank(bob);

    vm.expectRevert("not your rat");
    world.ratfun__importNFTToItem(ratId, tokenId);

    vm.stopPrank();
  }

  function testImportRevertRatIsDead() public {
    vm.startPrank(alice);

    uint256 tokenId = world.ratfun__exportItemToNFT(ratId, itemId);

    // Kill the rat
    world.ratfun__liquidateRat();

    vm.expectRevert("rat is dead");
    world.ratfun__importNFTToItem(ratId, tokenId);

    vm.stopPrank();
  }

  function testImportRevertNotNFTOwner() public {
    vm.startPrank(alice);
    uint256 tokenId = world.ratfun__exportItemToNFT(ratId, itemId);
    vm.stopPrank();

    // Bob creates his own rat and tries to import alice's NFT
    vm.startPrank(bob);
    approveGamePool(type(uint256).max);
    bytes32 bobRatId = world.ratfun__createRat("bob rat");

    vm.expectRevert("not NFT owner");
    world.ratfun__importNFTToItem(bobRatId, tokenId);

    vm.stopPrank();
  }

  function testImportRevertInventoryFull() public {
    // Fill up the inventory first
    prankAdmin();
    uint256 maxSize = GameConfig.getMaxInventorySize();
    Item[] memory items = new Item[](maxSize - 1); // -1 because we already have 1 item
    for (uint256 i = 0; i < maxSize - 1; i++) {
      items[i] = Item({ name: "Filler Item", value: 1 });
    }
    world.ratfun__applyOutcome(ratId, tripId, 0, new bytes32[](0), items);
    vm.stopPrank();

    // Export one item
    vm.startPrank(alice);
    uint256 tokenId = world.ratfun__exportItemToNFT(ratId, itemId);

    // Inventory should now be at max - 1, let's fill it back up
    vm.stopPrank();

    prankAdmin();
    Item[] memory oneMore = new Item[](1);
    oneMore[0] = Item({ name: "Last Item", value: 1 });
    world.ratfun__applyOutcome(ratId, tripId, 0, new bytes32[](0), oneMore);
    vm.stopPrank();

    // Now inventory is full, import should fail
    vm.startPrank(alice);
    vm.expectRevert("inventory full");
    world.ratfun__importNFTToItem(ratId, tokenId);

    vm.stopPrank();
  }

  function testNFTTransferAndImport() public {
    vm.startPrank(alice);
    uint256 tokenId = world.ratfun__exportItemToNFT(ratId, itemId);

    // Transfer NFT to bob
    ItemNFT nft = LibWorld.itemNFT();
    nft.transferFrom(alice, bob, tokenId);
    vm.stopPrank();

    // Bob creates a rat and imports the NFT
    vm.startPrank(bob);
    approveGamePool(type(uint256).max);
    bytes32 bobRatId = world.ratfun__createRat("bob rat");

    bytes32 returnedItemId = world.ratfun__importNFTToItem(bobRatId, tokenId);
    vm.stopPrank();

    // Same item ID, now in bob's rat inventory
    assertEq(returnedItemId, itemId);
    assertEq(Inventory.length(bobRatId), 1);
    assertEq(Inventory.getItem(bobRatId, 0), itemId);
  }
}
