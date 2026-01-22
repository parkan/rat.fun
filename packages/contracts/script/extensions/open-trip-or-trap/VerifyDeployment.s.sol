// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ChallengeConfig } from "../../../src/codegen/tables/ChallengeConfig.sol";
import { ActiveChallenge } from "../../../src/codegen/tables/ActiveChallenge.sol";

/**
 * @title VerifyDeployment
 * @notice Verifies the open-trip-or-trap upgrade was successful
 */
contract VerifyDeployment is Script {
  function run(address worldAddress) external {
    StoreSwitch.setStoreAddress(worldAddress);

    console.log("=== Verifying OpenTripOrTrap Deployment ===");
    console.log("World address:", worldAddress);

    // Check ChallengeConfig
    uint256 minCreationCost = ChallengeConfig.getMinCreationCost();
    uint32 activePeriodBlocks = ChallengeConfig.getActivePeriodBlocks();

    console.log("ChallengeConfig:");
    console.log("  minCreationCost:", minCreationCost);
    console.log("  activePeriodBlocks:", activePeriodBlocks);

    require(minCreationCost > 0, "minCreationCost not set");
    require(activePeriodBlocks > 0, "activePeriodBlocks not set");
    console.log("  [OK] ChallengeConfig values are set");

    // Check ActiveChallenge (should be empty/zero initially)
    bytes32 activeChallengeTripId = ActiveChallenge.getTripId();
    console.log("ActiveChallenge:");
    console.log("  tripId:");
    console.logBytes32(activeChallengeTripId);
    console.log("  [OK] ActiveChallenge table accessible");

    console.log("=== Verification complete ===");
  }
}
