// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { IWorld } from "../../../src/codegen/world/IWorld.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ManagerSystem } from "../../../src/systems/ManagerSystem.sol";

/**
 * @title RegisterManagerSystem
 * @notice Registers an already-deployed ManagerSystem contract with the World
 * @dev Use this when the ManagerSystem was deployed but registerSystem failed
 */
contract RegisterManagerSystem is Script {
  function run(address worldAddress, address managerSystemAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    console.log("=== Registering ManagerSystem ===");
    console.log("World address:", worldAddress);
    console.log("ManagerSystem address:", managerSystemAddress);

    ResourceId managerSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "ManagerSystem");
    console.log("Resource ID:");
    console.logBytes32(ResourceId.unwrap(managerSystemResource));

    IWorld(worldAddress).registerSystem(managerSystemResource, ManagerSystem(managerSystemAddress), true);
    console.log("ManagerSystem registered successfully!");

    vm.stopBroadcast();
  }
}
