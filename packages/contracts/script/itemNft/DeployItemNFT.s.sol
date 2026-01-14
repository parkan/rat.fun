// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

// MUD imports
import { IWorld } from "../../src/codegen/world/IWorld.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// New table to register
import { ItemNftConfig } from "../../src/codegen/tables/ItemNftConfig.sol";

// External contract
import { ItemNFT } from "../../src/external/ItemNFT.sol";

// System to deploy
import { ItemNFTSystem } from "../../src/systems/ItemNFTSystem.sol";

/**
 * @title DeployItemNFT
 * @notice Deploys the ItemNFT feature to an existing MUD world
 * @dev This script:
 *   1. Registers the ItemNftConfig table
 *   2. Deploys the ItemNFT ERC721 contract
 *   3. Sets the ItemNFT address in the config table
 *   4. Deploys and registers ItemNFTSystem
 *   5. Registers function selectors for exportItemToNFT and importNFTToItem
 */
contract DeployItemNFT is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Point StoreSwitch to the target world for table registration
    StoreSwitch.setStoreAddress(worldAddress);

    vm.startBroadcast(deployerPrivateKey);

    // ============================================
    // STEP 1: Register new table
    // ============================================
    console.log("=== Registering ItemNftConfig table ===");
    ItemNftConfig.register();
    console.log("ItemNftConfig registered");

    // ============================================
    // STEP 2: Deploy ItemNFT external contract
    // ============================================
    console.log("=== Deploying ItemNFT ===");
    ItemNFT itemNft = new ItemNFT(IWorld(worldAddress));
    console.log("ItemNFT deployed at:", address(itemNft));

    // ============================================
    // STEP 3: Set ItemNFT address in config
    // ============================================
    console.log("=== Setting ItemNFT address in config ===");
    ItemNftConfig.setItemNftAddress(address(itemNft));
    console.log("ItemNftConfig updated");

    // ============================================
    // STEP 4: Deploy and register ItemNFTSystem
    // ============================================
    console.log("=== Deploying ItemNFTSystem ===");

    ResourceId itemNftSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "ratfun", "ItemNFTSystem");

    ItemNFTSystem itemNftSystem = new ItemNFTSystem();
    console.log("ItemNFTSystem deployed at:", address(itemNftSystem));

    IWorld(worldAddress).registerSystem(itemNftSystemResource, itemNftSystem, true);
    console.log("ItemNFTSystem registered");

    // ============================================
    // STEP 5: Register function selectors
    // ============================================
    console.log("=== Registering function selectors ===");

    IWorld(worldAddress).registerFunctionSelector(itemNftSystemResource, "exportItemToNFT(bytes32,bytes32)");
    console.log("exportItemToNFT selector registered");

    IWorld(worldAddress).registerFunctionSelector(itemNftSystemResource, "importNFTToItem(bytes32,uint256)");
    console.log("importNFTToItem selector registered");

    vm.stopBroadcast();

    console.log("=== Deployment complete ===");
    console.log("ItemNFT address:", address(itemNft));
    console.log("ItemNFTSystem address:", address(itemNftSystem));
  }
}
