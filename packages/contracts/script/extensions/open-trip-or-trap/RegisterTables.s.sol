// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ChallengeConfig } from "../../../src/codegen/tables/ChallengeConfig.sol";
import { ActiveChallenge } from "../../../src/codegen/tables/ActiveChallenge.sol";
import { CHALLENGE_MIN_CREATION_COST, CHALLENGE_ACTIVE_PERIOD_BLOCKS } from "../../../src/constants.sol";

/**
 * @title RegisterTables
 * @notice Registers the new tables and initializes ChallengeConfig
 * @dev Use this if the main script fails at table registration
 */
contract RegisterTables is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    StoreSwitch.setStoreAddress(worldAddress);

    vm.startBroadcast(deployerPrivateKey);

    console.log("=== Registering tables ===");

    console.log("Registering ChallengeConfig...");
    ChallengeConfig.register();
    console.log("ChallengeConfig registered");

    console.log("Registering ActiveChallenge...");
    ActiveChallenge.register();
    console.log("ActiveChallenge registered");

    console.log("=== Initializing ChallengeConfig ===");
    ChallengeConfig.set(CHALLENGE_MIN_CREATION_COST, CHALLENGE_ACTIVE_PERIOD_BLOCKS);
    console.log("ChallengeConfig initialized");

    vm.stopBroadcast();
  }
}
