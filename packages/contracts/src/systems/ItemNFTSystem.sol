// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { CurrentRat, Dead, Inventory, Value, Name, ItemNftConfig, GameConfig } from "../codegen/index.sol";
import { LibUtils } from "../libraries/Libraries.sol";
import { ItemNFT } from "../external/ItemNFT.sol";

contract ItemNFTSystem is System {
  /**
   * @notice Export an item from rat's inventory to NFT
   * @param _ratId The rat's entity ID
   * @param _itemId The item's entity ID (must be in rat's inventory)
   * @return tokenId The minted NFT token ID
   */
  function exportItemToNFT(bytes32 _ratId, bytes32 _itemId) external returns (uint256 tokenId) {
    bytes32 playerId = LibUtils.addressToEntityKey(_msgSender());

    // Validate rat ownership
    require(CurrentRat.get(playerId) == _ratId, "not your rat");
    require(!Dead.get(_ratId), "rat is dead");

    // Remove item from inventory (reverts if not found)
    bytes32[] memory inventory = Inventory.get(_ratId);
    bytes32[] memory newInventory = LibUtils.removeFromArray(inventory, _itemId);
    require(newInventory.length < inventory.length, "item not in inventory");
    Inventory.set(_ratId, newInventory);

    // Get item data for NFT metadata
    string memory itemName = Name.get(_itemId);
    uint256 itemValue = Value.get(_itemId);

    // Mint NFT to player (stores itemId for re-import, name/value for display)
    ItemNFT nftContract = ItemNFT(ItemNftConfig.getItemNftAddress());
    tokenId = nftContract.mint(_msgSender(), _itemId, itemName, itemValue);
  }

  /**
   * @notice Import an NFT back into rat's inventory
   * @param _ratId The rat's entity ID to add item to
   * @param _tokenId The NFT token ID to burn and import
   * @return itemId The item entity ID that was restored
   */
  function importNFTToItem(bytes32 _ratId, uint256 _tokenId) external returns (bytes32 itemId) {
    bytes32 playerId = LibUtils.addressToEntityKey(_msgSender());

    // Validate rat ownership
    require(CurrentRat.get(playerId) == _ratId, "not your rat");
    require(!Dead.get(_ratId), "rat is dead");

    // Validate inventory has space
    uint256 inventorySize = Inventory.length(_ratId);
    require(inventorySize < GameConfig.getMaxInventorySize(), "inventory full");

    // Get NFT contract
    ItemNFT nftContract = ItemNFT(ItemNftConfig.getItemNftAddress());

    // Validate NFT ownership
    require(nftContract.ownerOf(_tokenId) == _msgSender(), "not NFT owner");

    // Burn the NFT and get the item's entity ID back
    itemId = nftContract.burn(_tokenId);

    // Add item back to rat's inventory
    Inventory.push(_ratId, itemId);
  }
}
