// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { IWorld } from "../../src/codegen/world/IWorld.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ItemNftConfig } from "../../src/codegen/tables/ItemNftConfig.sol";
import { ItemNFT } from "../../src/external/ItemNFT.sol";

/**
 * @title UpgradeItemNFT
 * @notice Deploys a new ItemNFT contract and updates the config
 * @dev Use this when you need to upgrade the NFT contract without redeploying the system
 *      Note: Existing NFTs on the old contract will NOT be migrated
 */
contract UpgradeItemNFT is Script {
  function run(address worldAddress) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    StoreSwitch.setStoreAddress(worldAddress);

    vm.startBroadcast(deployerPrivateKey);

    // Deploy new ItemNFT contract
    console.log("=== Deploying new ItemNFT ===");
    ItemNFT itemNft = new ItemNFT(IWorld(worldAddress));
    console.log("ItemNFT deployed at:", address(itemNft));

    // Update config to point to new contract
    console.log("=== Updating ItemNftConfig ===");
    ItemNftConfig.setItemNftAddress(address(itemNft));
    console.log("ItemNftConfig updated");

    vm.stopBroadcast();

    console.log("=== Upgrade complete ===");
    console.log("New ItemNFT address:", address(itemNft));
  }
}
