// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { ExternalAddressesConfig } from "../codegen/index.sol";
import { SalePlaceholder } from "../external/SalePlaceholder.sol";
import { LibWorld } from "../libraries/Libraries.sol";

contract DevSystem is System {
  /**
   * @dev Give the caller tokens. REMOVE IN PRODUCTION.
   */
  function giveCallerTokens() public {
    SalePlaceholder(ExternalAddressesConfig.getServiceAddress()).transferStartingTokens(LibWorld.erc20(), _msgSender());
  }
}
