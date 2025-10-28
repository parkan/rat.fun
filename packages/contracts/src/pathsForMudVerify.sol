// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// This file helps with `mud verify` path issues due to how forge generates artifacts, not relevant otherwise
import { World } from "@latticexyz/world/src/World.sol";
import { WorldProxy } from "@latticexyz/world/src/WorldProxy.sol";
import { WorldProxyFactory } from "@latticexyz/world/src/WorldProxyFactory.sol";
import { InitModule } from "@latticexyz/world/src/modules/init/InitModule.sol";
import { CallWithSignatureModule } from "@latticexyz/world-module-callwithsignature/src/CallWithSignatureModule.sol";
import { UniqueEntityModule } from "@latticexyz/world-modules/src/modules/uniqueentity/UniqueEntityModule.sol";
