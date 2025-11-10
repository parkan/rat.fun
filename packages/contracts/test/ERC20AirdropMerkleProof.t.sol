// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseTest } from "./BaseTest.sol";

import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { FakeRatERC20 } from "../src/external/FakeRatERC20.sol";
import { ERC20AirdropMerkleProof } from "../src/external/ERC20AirdropMerkleProof.sol";

contract ERC20AirdropMerkleProofTest is BaseTest {
  ERC20 erc20;
  ERC20AirdropMerkleProof airdrop;

  uint256 decimals;
  uint256 initialTokenBalance;

  uint256 anvil0Value;
  bytes32[] anvil0Proof;

  uint256 aliceValue;
  bytes32[] aliceProof;

  uint256 bobValue;
  bytes32[] bobProof;

  uint256 eveValue;
  bytes32[] eveProof;

  function setUp() public override {
    super.setUp();

    // See merkle-tree-claim's test_metadata
    bytes32 merkleRoot = 0x4c1b92236ea350508d7955b858e3b2df9bcfac77256f6e2f9f6be330593258b4;

    erc20 = new FakeRatERC20(address(this));
    airdrop = new ERC20AirdropMerkleProof(eve, address(erc20), merkleRoot);

    decimals = erc20.decimals();

    initialTokenBalance = 58000 * 10 ** decimals;
    erc20.transfer(address(airdrop), initialTokenBalance);

    anvil0Value = 50000e18;
    anvil0Proof = new bytes32[](2);
    anvil0Proof[0] = 0xb648fb3a6f7e3001cdf01202443bdb55290a9c854ff9d68d01eb46f718eedee5;
    anvil0Proof[1] = 0x47dba099b5ae79334e16c5e8e2d805b6bcee018d94ed30aea3a4076b6221d505;

    aliceValue = 2500e18;
    aliceProof = new bytes32[](2);
    aliceProof[0] = 0x7598b2ffcef488f1de0ea895c8a25039a69af6f0a6491c935a6ed42e014578ed;
    aliceProof[1] = 0xa531e60848f462cc39327df615c0c4eaacb1da7ae8e1fb8676b2d4b5be861325;

    bobValue = 1500e18;
    bobProof = new bytes32[](2);
    bobProof[0] = 0xc262501cc90213a7270668d8b8160c7927085cc2858b7e9e1930a4e383643776;
    bobProof[1] = 0x47dba099b5ae79334e16c5e8e2d805b6bcee018d94ed30aea3a4076b6221d505;

    eveValue = 500e18;
    eveProof = new bytes32[](3);
    eveProof[0] = 0x22f5a76273db625bc8f4833a2a2c676f86b006293ac5ec9067fddba904950e0e;
    eveProof[1] = 0xd5bb53b638cd4181cee037c233062782626da133c7f17f6c07ce53e982650bc9;
    eveProof[2] = 0xa531e60848f462cc39327df615c0c4eaacb1da7ae8e1fb8676b2d4b5be861325;
  }

  // Only admin can withdraw
  function testRevertNotAdmin() public {
    vm.prank(alice);
    vm.expectRevert(ERC20AirdropMerkleProof.NotAdmin.selector);
    airdrop.withdraw(1);

    vm.prank(bob);
    vm.expectRevert(ERC20AirdropMerkleProof.NotAdmin.selector);
    airdrop.withdraw(1);
  }

  function testWithdraw() public {
    assertEq(erc20.balanceOf(eve), 0);
    assertEq(erc20.balanceOf(address(airdrop)), initialTokenBalance);

    vm.prank(eve);
    airdrop.withdraw(initialTokenBalance);

    assertEq(erc20.balanceOf(eve), initialTokenBalance);
    assertEq(erc20.balanceOf(address(airdrop)), 0);

    vm.prank(eve);
    vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, airdrop, 0, 1));
    airdrop.withdraw(1);
  }

  function testClaim() public {
    assertEq(erc20.balanceOf(address(airdrop)), initialTokenBalance);

    assertEq(erc20.balanceOf(alice), 0);
    airdrop.claim(alice, aliceValue, aliceProof);
    assertEq(erc20.balanceOf(alice), aliceValue);
    assertEq(erc20.balanceOf(address(airdrop)), initialTokenBalance - aliceValue);

    vm.expectRevert(ERC20AirdropMerkleProof.AlreadyClaimed.selector);
    airdrop.claim(alice, aliceValue, aliceProof);

    assertEq(erc20.balanceOf(bob), 0);
    airdrop.claim(bob, bobValue, bobProof);
    assertEq(erc20.balanceOf(bob), bobValue);
    assertEq(erc20.balanceOf(address(airdrop)), initialTokenBalance - aliceValue - bobValue);

    vm.expectRevert(ERC20AirdropMerkleProof.AlreadyClaimed.selector);
    airdrop.claim(bob, bobValue, bobProof);

    assertEq(erc20.balanceOf(eve), 0);
    airdrop.claim(eve, eveValue, eveProof);
    assertEq(erc20.balanceOf(eve), eveValue);
    assertEq(erc20.balanceOf(address(airdrop)), initialTokenBalance - aliceValue - bobValue - eveValue);

    vm.expectRevert(ERC20AirdropMerkleProof.AlreadyClaimed.selector);
    airdrop.claim(eve, eveValue, eveProof);
  }

  function testRevertInsufficientAirdropContractBalance() public {
    vm.prank(address(airdrop));
    erc20.transfer(eve, initialTokenBalance);

    vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, airdrop, 0, aliceValue));
    airdrop.claim(alice, aliceValue, aliceProof);
  }

  function testRevertInvalidMerkleProof() public {
    vm.expectRevert(ERC20AirdropMerkleProof.InvalidMerkleProof.selector);
    airdrop.claim(alice, bobValue, bobProof);

    vm.expectRevert(ERC20AirdropMerkleProof.InvalidMerkleProof.selector);
    airdrop.claim(bob, bobValue, new bytes32[](2));
  }
}
