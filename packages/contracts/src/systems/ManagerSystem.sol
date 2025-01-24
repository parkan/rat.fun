// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { GameConfig, EntityType, Balance, Inventory, LoadOut, Health, Traits, Dead } from "../codegen/index.sol";
import { LibUtils, LibItem, LibTrait } from "../libraries/Libraries.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";
import { MAX_LOADOUT_SIZE, MAX_TRAITS_SIZE } from "../constants.sol";

  /**
   * @dev Only admin can call these function
   */
contract ManagerSystem is System {

  /**
   * @dev Modifier to restrict access to admin only
   */
  modifier onlyAdmin() {
    require(_msgSender() == GameConfig.getAdminAddress(), "not allowed");
    _;
  }

  /**
   * @notice Create item and add to rat's load out
   * @dev Only admin can call this function
   * @param _ratId The id of the rat
   * @param _name Description of the item
   * @param _value Value of the item
   * @return itemId The id of the new item
   */
  function addItemToLoadOut(bytes32 _ratId, string memory _name, int256 _value) public onlyAdmin returns (bytes32 itemId) {
    require(LoadOut.get(_ratId).length < MAX_LOADOUT_SIZE, "full");
    itemId = LibItem.createItem(_name, _value);
    LoadOut.push(_ratId, itemId);
  }

  /**
   * @notice Remove item from rat's load out and destroy the item
   * @dev Only admin can call this function
   * @param _ratId The id of the rat
   * @param _itemId The id of the item
   */
  function removeItemFromLoadOut(bytes32 _ratId, bytes32 _itemId) public onlyAdmin {
    LibItem.destroyItem(_itemId);
    LoadOut.set(_ratId, LibUtils.removeFromArray(LoadOut.get(_ratId), _itemId));
  }

  /**
   * @notice Add a trait to rat
   * @dev Only admin can call this function
   * @param _ratId The id of the rat
   * @param _name Description of the trait
   * @param _value Value of the trait
   * @return traitId The id of the new trait
   */
  function addTraitToRat(bytes32 _ratId, string memory _name, int256 _value) public onlyAdmin returns (bytes32 traitId) {
    require(Traits.get(_ratId).length < MAX_TRAITS_SIZE, "full");
    traitId = LibTrait.createTrait(_name, _value);
    // Add trait to rat
    Traits.push(_ratId, traitId);
  }

  /**
   * @notice Remove trait from rat
   * @dev Only admin can call this function
   * @param _ratId The id of the rat
   * @param _traitId Id of trait to remove
   */
  function removeTraitFromRat(bytes32 _ratId, bytes32 _traitId) onlyAdmin public {
    LibTrait.destroyTrait(_traitId);
    // Remove trait from rat
    Traits.set(_ratId, LibUtils.removeFromArray(Traits.get(_ratId), _traitId));
  }

  /**
   * @notice Increase balance
   * @dev Only admin can call this function
   * @param _id The id of the entity (room or rat)
   * @param _change Amount to increase balance by
   */
  function increaseBalance(bytes32 _id, uint256 _change) onlyAdmin public {
    Balance.set(_id, Balance.get(_id) + _change);
  }

  /**
   * @notice Decrease balance
   * @dev Only admin can call this function
   * @param _id The id of the entity (room or rat)
   * @param _change Amount to decrease balance by
   */
  function decreaseBalance(bytes32 _id, uint256 _change) onlyAdmin public {
    Balance.set(_id, LibUtils.safeSubtract(Balance.get(_id), _change));
  }

  /**
   * @notice Increase rat's health
   * @dev Only admin can call this function
   * @param _ratId The id of the rat
   * @param _change Amount to increase health by
   */
  function increaseHealth(bytes32 _ratId, uint256 _change) onlyAdmin public {
    Health.set(_ratId, Health.get(_ratId) + _change);
  }

  /**
   * @notice Decrease rat's health
   * @dev Only admin can call this function. Kills rat if health is 0.
   * @param _ratId The id of the rat
   * @param _change Amount to decrease health by
   */
  function decreaseHealth(bytes32 _ratId, uint256 _change) onlyAdmin public {
    Health.set(_ratId, LibUtils.safeSubtract(Health.get(_ratId), _change));
    // Kill rat if health is 0
    if (Health.get(_ratId) == 0) {
      Dead.set(_ratId, true);
    }
  }
}
