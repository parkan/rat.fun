// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { IWorld } from "../../../src/codegen/world/IWorld.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

/**
 * @title RegisterCreateTripSelector
 * @notice Registers the new createTrip function selector with challenge trip parameters
 * @dev Use this after upgrading TripSystem to register the new 7-parameter signature
 */
contract RegisterCreateTripSelector is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    console.log("=== Registering createTrip function selector ===");
    console.log("World address:", worldAddress);

    ResourceId tripSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "TripSystem");
    console.log("TripSystem Resource ID:");
    console.logBytes32(ResourceId.unwrap(tripSystemResource));

    // Register the new createTrip signature with challenge trip parameters
    IWorld(worldAddress).registerFunctionSelector(
      tripSystemResource,
      "createTrip(bytes32,bytes32,uint256,bool,uint256,uint256,string)"
    );
    console.log("createTrip function selector registered successfully!");

    vm.stopBroadcast();
  }
}
