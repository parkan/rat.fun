// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { GameConfig, Trait } from "../codegen/index.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { LibRoom } from "../libraries/Libraries.sol";

contract RatSystem is System {
  function addTrait(bytes32 ratId, string memory newTrait) public {
    require(_msgSender() == GameConfig.getAdminAddress(), "not allowed");
    string memory currentTrait = Trait.get(ratId);
    string memory updatedTrait = string(abi.encodePacked(currentTrait, ", ", newTrait));
    Trait.set(ratId, updatedTrait);
  }
}
