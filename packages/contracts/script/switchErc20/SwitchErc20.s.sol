// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IWorld } from "../../src/codegen/world/IWorld.sol";
import { ExternalAddressesConfig } from "../../src/codegen/index.sol";
import { GamePool } from "../../src/external/GamePool.sol";

/**
 * @title SwitchErc20
 * @notice Switch the ERC20 token used by the world
 *
 * Steps:
 * 1. Deploy new GamePool with new ERC20
 * 2. Update ExternalAddressesConfig (erc20Address + gamePoolAddress)
 *
 * Usage:
 * forge script script/switchErc20/SwitchErc20.s.sol:SwitchErc20 \
 *   --sig "run(address,address)" <WORLD_ADDRESS> <NEW_ERC20_ADDRESS> \
 *   --rpc-url $RPC_URL --broadcast
 */
contract SwitchErc20 is Script {
  function run(address worldAddress, address newErc20Address) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    console.log("Old ERC20:", ExternalAddressesConfig.getErc20Address());
    console.log("Old GamePool:", ExternalAddressesConfig.getGamePoolAddress());
    console.log("New ERC20:", newErc20Address);

    vm.startBroadcast(deployerPrivateKey);

    // 1. Deploy new GamePool
    GamePool newGamePool = new GamePool(world, IERC20(newErc20Address));
    console.log("New GamePool:", address(newGamePool));

    // // 2. Update config
    ExternalAddressesConfig.setErc20Address(newErc20Address);
    ExternalAddressesConfig.setGamePoolAddress(address(newGamePool));

    vm.stopBroadcast();

    console.log("Done");
  }
}
