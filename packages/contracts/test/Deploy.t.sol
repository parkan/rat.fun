// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;
import { BaseTest } from "./BaseTest.sol";
import "../src/codegen/index.sol";
import "../src/libraries/Libraries.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

contract DeployTest is BaseTest {
  using WorldResourceIdInstance for ResourceId;

  function testWorldExists() public view {
    uint256 codeSize;
    address addr = worldAddress;
    assembly {
      codeSize := extcodesize(addr)
    }
    assertTrue(codeSize > 0);
  }

  function testERC20Supply() public view {
    // NOTE! This should be 90M once the liquidity allocation is added
    assertEq(LibWorld.erc20().totalSupply(), 82_000_000 * 1e18);
  }
}
