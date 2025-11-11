// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { IWorld } from "../../../src/codegen/world/IWorld.sol";
import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

// Create resource identifiers (for the namespace and system)
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// For deploying systems
import { ManagerSystem } from "../../../src/systems/ManagerSystem.sol";

contract DeployManagerSystem is Script {
  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "ManagerSystem");

    vm.startBroadcast(deployerPrivateKey);

    ManagerSystem managerSystem = new ManagerSystem();
    console.log("ManagerSystem address: ", address(managerSystem));

    IWorld(worldAddress).registerSystem(systemResource, managerSystem, true);

    vm.stopBroadcast();
  }
}
