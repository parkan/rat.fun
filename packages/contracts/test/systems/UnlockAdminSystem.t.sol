// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;
import { BaseTest } from "../BaseTest.sol";
import "../../src/codegen/index.sol";
import "../../src/libraries/Libraries.sol";
import { ENTITY_TYPE } from "../../src/codegen/common.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract UnlockAdminSystemTest is BaseTest {
  function testUnlockAdmin() public {
    setInitialBalance(alice);
    vm.startPrank(alice);

    bytes32 playerId = world.ratfun__spawn("alice");
    approveGamePool(type(uint256).max);

    // Get initial balances
    uint256 playerBalanceBefore = LibWorld.erc20().balanceOf(alice);
    uint256 feeAddressBalanceBefore = LibWorld.erc20().balanceOf(ExternalAddressesConfig.getFeeAddress());

    // Verify player doesn't have master key initially
    assertFalse(MasterKey.get(playerId));

    startGasReport("Unlock admin");
    world.ratfun__unlockAdmin();
    endGasReport();

    vm.stopPrank();

    // Check that master key is now set
    assertTrue(MasterKey.get(playerId));

    // Check that 500 tokens were transferred from player
    uint256 unlockCost = 500 * 10 ** LibWorld.erc20().decimals();
    assertEq(LibWorld.erc20().balanceOf(alice), playerBalanceBefore - unlockCost);

    // Check that 500 tokens were transferred to fee address
    assertEq(LibWorld.erc20().balanceOf(ExternalAddressesConfig.getFeeAddress()), feeAddressBalanceBefore + unlockCost);
  }

  function testRevertAlreadyUnlocked() public {
    setInitialBalance(alice);
    vm.startPrank(alice);

    world.ratfun__spawn("alice");
    approveGamePool(type(uint256).max);

    // First unlock should succeed
    world.ratfun__unlockAdmin();

    // Second unlock should revert
    vm.expectRevert("already unlocked");
    world.ratfun__unlockAdmin();

    vm.stopPrank();
  }

  function testRevertInsufficientBalance() public {
    setInitialBalance(alice);
    vm.startPrank(alice);

    bytes32 playerId = world.ratfun__spawn("alice");
    approveGamePool(type(uint256).max);

    // Transfer away all but 400 tokens (less than 500 unlock cost)
    uint256 playerBalance = LibWorld.erc20().balanceOf(alice);
    uint256 tokensToKeep = 400 * 10 ** LibWorld.erc20().decimals();
    LibWorld.erc20().transfer(bob, playerBalance - tokensToKeep);

    // Verify player has less than 500 tokens
    assertLt(LibWorld.erc20().balanceOf(alice), 500 * 10 ** LibWorld.erc20().decimals());

    // Attempt to unlock should revert due to insufficient balance
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InsufficientBalance.selector,
        alice,
        tokensToKeep,
        500 * 10 ** LibWorld.erc20().decimals()
      )
    );
    world.ratfun__unlockAdmin();

    // Verify master key was not set
    assertFalse(MasterKey.get(playerId));

    vm.stopPrank();
  }

  function testRevertInsufficientApproval() public {
    setInitialBalance(alice);
    vm.startPrank(alice);

    bytes32 playerId = world.ratfun__spawn("alice");

    // Approve less than 500 tokens
    uint256 insufficientApproval = 400 * 10 ** LibWorld.erc20().decimals();
    approveGamePool(insufficientApproval);

    // Attempt to unlock should revert due to insufficient approval
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InsufficientAllowance.selector,
        address(LibWorld.gamePool()),
        insufficientApproval,
        500 * 10 ** LibWorld.erc20().decimals()
      )
    );
    world.ratfun__unlockAdmin();

    // Verify master key was not set
    assertFalse(MasterKey.get(playerId));

    vm.stopPrank();
  }

  function testUnlockAdminWithExactBalance() public {
    setInitialBalance(alice);
    vm.startPrank(alice);

    bytes32 playerId = world.ratfun__spawn("alice");
    approveGamePool(type(uint256).max);

    // Transfer away all but exactly 500 tokens
    uint256 playerBalance = LibWorld.erc20().balanceOf(alice);
    uint256 tokensToKeep = 500 * 10 ** LibWorld.erc20().decimals();
    LibWorld.erc20().transfer(bob, playerBalance - tokensToKeep);

    // Verify player has exactly 500 tokens
    assertEq(LibWorld.erc20().balanceOf(alice), 500 * 10 ** LibWorld.erc20().decimals());

    // Unlock should succeed with exact balance
    world.ratfun__unlockAdmin();

    // Verify master key was set
    assertTrue(MasterKey.get(playerId));

    // Verify player balance is now 0
    assertEq(LibWorld.erc20().balanceOf(alice), 0);

    vm.stopPrank();
  }

  function testMultiplePlayersCanUnlock() public {
    setInitialBalance(alice);
    setInitialBalance(bob);

    // Alice unlocks
    vm.startPrank(alice);
    bytes32 aliceId = world.ratfun__spawn("alice");
    approveGamePool(type(uint256).max);
    world.ratfun__unlockAdmin();
    assertTrue(MasterKey.get(aliceId));
    vm.stopPrank();

    // Bob unlocks
    vm.startPrank(bob);
    bytes32 bobId = world.ratfun__spawn("bob");
    approveGamePool(type(uint256).max);
    world.ratfun__unlockAdmin();
    assertTrue(MasterKey.get(bobId));
    vm.stopPrank();

    // Both should have master keys
    assertTrue(MasterKey.get(aliceId));
    assertTrue(MasterKey.get(bobId));
  }
}
