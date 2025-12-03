// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { RatRouter, PoolKey } from "../src/external/swap-router/RatRouter.sol";

interface IDERC20BuyLimit {
  function setCountryCode(string calldata countryCode) external;
  function balanceOf(address account) external view returns (uint256);
}

uint256 constant BASE_MAINNET_CHAIN_ID = 8453;

// Base Mainnet fork tests, run `rat-router-fork-test` script in package.json
contract RatRouterForkTest is Test {
  address constant weth = 0x4200000000000000000000000000000000000006;
  address constant permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
  address constant eurc = 0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42;
  RatRouter constant ratRouter = RatRouter(0x0dAC1415e9DB2917E4Db14b27961378b7DDfD19B);
  IDERC20BuyLimit ratToken = IDERC20BuyLimit(0xf2DD384662411A21259ab17038574289091F2D41);

  bytes pathWethToEurc;
  bytes pathEurcToWeth;
  PoolKey poolKey;

  function _deployCodeToRouter() internal {
    address universalRouter = 0x6fF5693b99212Da76ad316178A184AB56D299b43;
    address uniswapV4Quoter = 0x0d5e0F971ED27FBfF6c2837bf31316121532048D;
    // the newer one is 0xcbBb8035cAc7D4B3Ca7aBb74cF7BdF900215Ce0D but eurc pools use the legacy one
    address aerodromeRouter = 0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5;
    // the newer one is 0x3d4C22254F86f64B7eC90ab8F7aeC1FBFD271c6C but eurc pools use the legacy one
    address aerodromeQuoter = 0x254cF9E1E6e233aa1AC962CB9B05b2cfeAaE15b0;

    deployCodeTo(
      "RatRouter.sol",
      abi.encode(weth, permit2, universalRouter, aerodromeRouter, uniswapV4Quoter, aerodromeQuoter),
      address(ratRouter)
    );
  }

  function _warpAuctionStart() internal {
    vm.warp(1765292400);
  }

  function _warpBeforeAuctionEnd() internal {
    vm.warp(1767970800 - 100);
  }

  function _warpAfterAuctionEnd() internal {
    vm.warp(1767970800);
  }

  function setUp() public {
    // Can be used to test changes before deploying
    // _deployCodeToRouter();

    pathWethToEurc = abi.encodePacked(weth, int24(100), eurc);
    pathEurcToWeth = abi.encodePacked(eurc, int24(100), weth);

    poolKey = PoolKey({
      currency0: eurc,
      currency1: address(ratToken),
      fee: 8388608,
      tickSpacing: 30,
      hooks: 0x20A265758c73BCebEa0dc7eadA74DFB380C6f8e0
    });
  }

  function testQuoteExactOut() public {
    vm.skip(block.chainid != BASE_MAINNET_CHAIN_ID);

    _warpAuctionStart();

    (uint256 amountInInitial, uint256 amountInUniswap) = ratRouter.quoteExactOut(
      1000e18,
      pathEurcToWeth,
      poolKey,
      true
    );

    // At the start 1000 RAT ~= 0.0053 WETH and 14 EURC
    assertApproxEqRel(amountInInitial, 0.0053e18, 0.10e18);
    assertApproxEqRel(amountInUniswap, 14e6, 0.10e18);

    _warpBeforeAuctionEnd();

    (amountInInitial, amountInUniswap) = ratRouter.quoteExactOut(1000e18, pathEurcToWeth, poolKey, true);

    // At the end 1000 RAT ~= 0.0019 WETH and 5 EURC
    assertApproxEqRel(amountInInitial, 0.0019e18, 0.10e18);
    assertApproxEqRel(amountInUniswap, 5e6, 0.10e18);
  }

  function testSwapExactInEth() public {
    vm.skip(block.chainid != BASE_MAINNET_CHAIN_ID);

    _warpAuctionStart();
    ratToken.setCountryCode("RU");

    ratRouter.swapExactInEth{ value: 0.30 ether }(pathWethToEurc, poolKey, true, type(uint128).max);

    ratRouter.swapExactInEth{ value: 0.04 ether }(pathWethToEurc, poolKey, true, type(uint128).max);

    // At the start 0.34 ETH ~= 65_000 RAT
    assertApproxEqRel(ratToken.balanceOf(address(this)), 65_000e18, 0.10e18);
  }

  function testRevertExceedLimit() public {
    vm.skip(block.chainid != BASE_MAINNET_CHAIN_ID);

    _warpAuctionStart();
    ratToken.setCountryCode("RU");

    vm.expectRevert();
    ratRouter.swapExactInEth{ value: 0.38 ether }(pathWethToEurc, poolKey, true, type(uint128).max);

    ratRouter.swapExactInEth{ value: 0.34 ether }(pathWethToEurc, poolKey, true, type(uint128).max);

    vm.expectRevert();
    ratRouter.swapExactInEth{ value: 0.04 ether }(pathWethToEurc, poolKey, true, type(uint128).max);
  }

  function testRevertNotOngoing() public {
    vm.skip(block.chainid != BASE_MAINNET_CHAIN_ID);

    vm.expectRevert();
    ratRouter.swapExactInEth{ value: 0.1 ether }(pathWethToEurc, poolKey, true, type(uint128).max);

    _warpAfterAuctionEnd();

    vm.expectRevert();
    ratRouter.swapExactInEth{ value: 0.1 ether }(pathWethToEurc, poolKey, true, type(uint128).max);
  }
}
