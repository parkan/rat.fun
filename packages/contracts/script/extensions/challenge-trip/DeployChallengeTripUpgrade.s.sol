// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

// MUD imports
import { IWorld } from "../../../src/codegen/world/IWorld.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// New tables to register
import { ChallengeTrip } from "../../../src/codegen/tables/ChallengeTrip.sol";
import { ChallengeWinner } from "../../../src/codegen/tables/ChallengeWinner.sol";
import { FixedMinValueToEnter } from "../../../src/codegen/tables/FixedMinValueToEnter.sol";
import { OverrideMaxValuePerWinPercentage } from "../../../src/codegen/tables/OverrideMaxValuePerWinPercentage.sol";

// Systems to upgrade
import { TripSystem } from "../../../src/systems/TripSystem.sol";
import { ManagerSystem } from "../../../src/systems/ManagerSystem.sol";

/**
 * @title DeployChallengeTripUpgrade
 * @notice Upgrades an existing MUD world to support challenge trips
 * @dev This script:
 *   1. Registers 4 new tables: ChallengeTrip, ChallengeWinner, FixedMinValueToEnter, OverrideMaxValuePerWinPercentage
 *   2. Deploys and registers updated TripSystem (new createTrip signature with challenge params)
 *   3. Deploys and registers updated ManagerSystem (sets ChallengeWinner to player ID)
 */
contract DeployChallengeTripUpgrade is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Point StoreSwitch to the target world for table registration
    StoreSwitch.setStoreAddress(worldAddress);

    vm.startBroadcast(deployerPrivateKey);

    // ============================================
    // STEP 1: Register new tables
    // ============================================
    console.log("=== Registering new tables ===");

    console.log("Registering ChallengeTrip table...");
    ChallengeTrip.register();
    console.log("ChallengeTrip registered");

    console.log("Registering ChallengeWinner table...");
    ChallengeWinner.register();
    console.log("ChallengeWinner registered");

    console.log("Registering FixedMinValueToEnter table...");
    FixedMinValueToEnter.register();
    console.log("FixedMinValueToEnter registered");

    console.log("Registering OverrideMaxValuePerWinPercentage table...");
    OverrideMaxValuePerWinPercentage.register();
    console.log("OverrideMaxValuePerWinPercentage registered");

    // ============================================
    // STEP 2: Deploy and register updated TripSystem
    // ============================================
    console.log("=== Deploying TripSystem ===");

    ResourceId tripSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "TripSystem");

    TripSystem tripSystem = new TripSystem();
    console.log("TripSystem deployed at: ", address(tripSystem));

    IWorld(worldAddress).registerSystem(tripSystemResource, tripSystem, true);
    console.log("TripSystem registered");

    // ============================================
    // STEP 3: Deploy and register updated ManagerSystem
    // ============================================
    console.log("=== Deploying ManagerSystem ===");

    ResourceId managerSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "ManagerSystem");

    ManagerSystem managerSystem = new ManagerSystem();
    console.log("ManagerSystem deployed at: ", address(managerSystem));

    IWorld(worldAddress).registerSystem(managerSystemResource, managerSystem, true);
    console.log("ManagerSystem registered");

    vm.stopBroadcast();

    console.log("=== Upgrade complete ===");
  }
}
