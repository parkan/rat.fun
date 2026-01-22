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
import { ChallengeConfig } from "../../../src/codegen/tables/ChallengeConfig.sol";
import { ActiveChallenge } from "../../../src/codegen/tables/ActiveChallenge.sol";

// Systems to upgrade
import { TripSystem } from "../../../src/systems/TripSystem.sol";
import { ManagerSystem } from "../../../src/systems/ManagerSystem.sol";

// Constants for initialization
import { CHALLENGE_MIN_CREATION_COST, CHALLENGE_ACTIVE_PERIOD_BLOCKS } from "../../../src/constants.sol";

/**
 * @title DeployOpenTripOrTrap
 * @notice Upgrades an existing MUD world to support global one-active-challenge limit
 * @dev This script:
 *   1. Registers ChallengeConfig table (singleton for min cost and active period)
 *   2. Registers ActiveChallenge table (singleton for global active challenge tracking)
 *   3. Deploys and registers updated TripSystem (new setChallengeConfig, global challenge limit)
 *   4. Deploys and registers updated ManagerSystem (clears ActiveChallenge on win)
 *   5. Registers setChallengeConfig function selector
 *   6. Initializes ChallengeConfig with default values
 */
contract DeployOpenTripOrTrap is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Point StoreSwitch to the target world for table registration
    StoreSwitch.setStoreAddress(worldAddress);

    vm.startBroadcast(deployerPrivateKey);

    // ============================================
    // STEP 1: Register new tables
    // ============================================
    console.log("=== Registering new tables ===");

    console.log("Registering ChallengeConfig table...");
    ChallengeConfig.register();
    console.log("ChallengeConfig registered");

    console.log("Registering ActiveChallenge table (singleton)...");
    ActiveChallenge.register();
    console.log("ActiveChallenge registered");

    // ============================================
    // STEP 2: Deploy and register updated TripSystem
    // ============================================
    console.log("=== Deploying TripSystem ===");

    ResourceId tripSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "TripSystem");

    TripSystem tripSystem = new TripSystem();
    console.log("TripSystem deployed at:", address(tripSystem));

    IWorld(worldAddress).registerSystem(tripSystemResource, tripSystem, true);
    console.log("TripSystem registered");

    // ============================================
    // STEP 3: Deploy and register updated ManagerSystem
    // ============================================
    console.log("=== Deploying ManagerSystem ===");

    ResourceId managerSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "ManagerSystem");

    ManagerSystem managerSystem = new ManagerSystem();
    console.log("ManagerSystem deployed at:", address(managerSystem));

    IWorld(worldAddress).registerSystem(managerSystemResource, managerSystem, true);
    console.log("ManagerSystem registered");

    // ============================================
    // STEP 4: Register new function selector
    // ============================================
    console.log("=== Registering function selectors ===");

    IWorld(worldAddress).registerFunctionSelector(tripSystemResource, "setChallengeConfig(uint256,uint32)");
    console.log("setChallengeConfig selector registered");

    // ============================================
    // STEP 5: Initialize ChallengeConfig
    // ============================================
    console.log("=== Initializing ChallengeConfig ===");

    ChallengeConfig.set(CHALLENGE_MIN_CREATION_COST, CHALLENGE_ACTIVE_PERIOD_BLOCKS);
    console.log("ChallengeConfig initialized:");
    console.log("  minCreationCost:", CHALLENGE_MIN_CREATION_COST);
    console.log("  activePeriodBlocks:", CHALLENGE_ACTIVE_PERIOD_BLOCKS);

    vm.stopBroadcast();

    console.log("=== Upgrade complete ===");
  }
}
