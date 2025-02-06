// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { GameConfig, EntityType, Balance, Name, OwnedRat, Inventory, Dead, Level } from "../codegen/index.sol";
import { LibUtils } from "../libraries/Libraries.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";
import { MAX_INVENTORY_SIZE, MAX_LOADOUT_SIZE } from "../constants.sol";

contract DevSystem is System {
    function givePlayerBalance(uint256 _amount) public {
        bytes32 playerId = LibUtils.addressToEntityKey(_msgSender());
        Balance.set(playerId, Balance.get(playerId) + _amount);
    }

    function giveRatBalance(uint256 _amount) public {
        bytes32 playerId = LibUtils.addressToEntityKey(_msgSender());
        bytes32 ratId = OwnedRat.get(playerId);
        Balance.set(ratId, Balance.get(ratId) + _amount);
    }
}
