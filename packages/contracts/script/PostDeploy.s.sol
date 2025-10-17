// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { MockV3Aggregator } from "@chainlink/contracts/src/v0.8/shared/mocks/MockV3Aggregator.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { worldRegistrationSystem } from "@latticexyz/world/src/codegen/experimental/systems/WorldRegistrationSystemLib.sol";

import { GameConfig } from "../src/codegen/index.sol";
import { devSystem, DevSystem } from "../src/codegen/systems/DevSystemLib.sol";

import { LibWorld, LibTrip } from "../src/libraries/Libraries.sol";

import { FakeRatERC20 } from "../src/external/FakeRatERC20.sol";
import { GamePool } from "../src/external/GamePool.sol";
import { SalePlaceholder } from "../src/external/SalePlaceholder.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    address serviceAddress;

    if (block.chainid == 31337 || block.chainid == 84532) {
      // Local/test chains
      // Deploy DevSystem
      bool systemExists = ResourceIds.getExists(devSystem.toResourceId());
      worldRegistrationSystem.registerSystem(devSystem.toResourceId(), new DevSystem(), true);
      // Register selectors if this is the first time deploying the system
      if (!systemExists) {
        worldRegistrationSystem.registerFunctionSelector(devSystem.toResourceId(), "giveCallerTokens()");
      }

      // Set testnet service address to a placeholder that freely distributes tokens
      serviceAddress = address(new SalePlaceholder(world));
    } else if (block.chainid == 8453) {
      // Base mainnet
      revert("TODO set mainnet service addresses if it is not the deployer");
      //serviceAddress = vm.addr(deployerPrivateKey);
    } else {
      revert("Unreconginzed chain");
    }

    // Deploy temporary ERC-20
    FakeRatERC20 erc20 = new FakeRatERC20(address(serviceAddress));
    // Deploy GamePool
    GamePool gamePool = new GamePool(world, erc20);

    // Root namespace owner is admin
    LibWorld.init(NamespaceOwner.get(ROOT_NAMESPACE_ID), address(erc20), address(gamePool), serviceAddress);
    vm.stopBroadcast();
  }
}
