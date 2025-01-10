// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { EntityType, Currency, Energy, Health, Trait, Owner, OwnedRat} from "../codegen/index.sol";
import { LibUtils, LibRandom } from "../libraries/Libraries.sol";
import { ENTITY_TYPE } from "../codegen/common.sol";

contract SpawnSystem is System {
    function spawn() public returns (bytes32 playerEntity) {
        playerEntity = LibUtils.addressToEntityKey(_msgSender());
        bytes32 ratEntity = getUniqueEntity();

        string[5] memory traits = [
            "intelligent",
            "strong",
            "psychic",
            "autistic",
            "nightvision goggles"
        ];

        // Create player
        EntityType.set(playerEntity, ENTITY_TYPE.PLAYER);
        Currency.set(playerEntity, 0);
        OwnedRat.set(playerEntity, ratEntity);

        // Create rat
        EntityType.set(ratEntity, ENTITY_TYPE.RAT);
        Health.set(ratEntity, 100);
        Energy.set(ratEntity, 100);
        Owner.set(ratEntity, playerEntity);
        Trait.set(ratEntity, traits[LibRandom.random2(_msgSender(), traits.length)]);
    }
}