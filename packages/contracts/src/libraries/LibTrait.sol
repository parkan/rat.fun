// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { EntityType, Name } from "../codegen/index.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";

library LibTrait {
  /**
   * @notice Create a trait
   * @param _name Description of trait
   * @return traitId The id of the new trait
   */
  function createTrait(string memory _name) internal returns (bytes32 traitId) {
    traitId = getUniqueEntity();
    EntityType.set(traitId, ENTITY_TYPE.TRAIT);
    Name.set(traitId, _name);
  }

  /**
   * @notice Destroy a trait
   * @param _traitId The id of the trait
   */
  function destroyTrait(bytes32 _traitId) internal {
    EntityType.deleteRecord(_traitId);
    Name.deleteRecord(_traitId);
  }
}
