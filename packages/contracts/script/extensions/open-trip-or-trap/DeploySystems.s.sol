// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { IWorld } from "../../../src/codegen/world/IWorld.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { TripSystem } from "../../../src/systems/TripSystem.sol";
import { ManagerSystem } from "../../../src/systems/ManagerSystem.sol";

/**
 * @title DeploySystems
 * @notice Deploys and registers updated TripSystem and ManagerSystem
 * @dev Use this if the main script fails at system deployment
 */
contract DeploySystems is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    // Deploy and register TripSystem
    console.log("=== Deploying TripSystem ===");
    ResourceId tripSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "TripSystem");

    TripSystem tripSystem = new TripSystem();
    console.log("TripSystem deployed at:", address(tripSystem));

    IWorld(worldAddress).registerSystem(tripSystemResource, tripSystem, true);
    console.log("TripSystem registered");

    // Deploy and register ManagerSystem
    console.log("=== Deploying ManagerSystem ===");
    ResourceId managerSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "ManagerSystem");

    ManagerSystem managerSystem = new ManagerSystem();
    console.log("ManagerSystem deployed at:", address(managerSystem));

    IWorld(worldAddress).registerSystem(managerSystemResource, managerSystem, true);
    console.log("ManagerSystem registered");

    // Register new function selector
    console.log("=== Registering function selector ===");
    IWorld(worldAddress).registerFunctionSelector(tripSystemResource, "setChallengeConfig(uint256,uint32)");
    console.log("setChallengeConfig selector registered");

    vm.stopBroadcast();
  }
}
