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
import { UnlockAdminSystem } from "../../../src/systems/UnlockAdminSystem.sol";

contract DeployUnlockAdminSystem is Script {
  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Must use "ratfun" namespace to have access to GamePool
    // UnlockAdminSystem is shortened to fit in the 16 bytes of the resource id
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "UnlockAdminSyste");

    vm.startBroadcast(deployerPrivateKey);

    UnlockAdminSystem unlockAdminSystem = new UnlockAdminSystem();
    console.log("UnlockAdminSystem address: ", address(unlockAdminSystem));

    IWorld(worldAddress).registerSystem(systemResource, unlockAdminSystem, true);
    IWorld(worldAddress).registerFunctionSelector(systemResource, "unlockAdmin()");

    vm.stopBroadcast();
  }
}
