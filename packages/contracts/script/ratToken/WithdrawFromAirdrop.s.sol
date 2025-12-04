// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ERC20AirdropMerkleProof } from "../../src/external/ERC20AirdropMerkleProof.sol";

contract WithdrawFromAirdrop is Script {
  address constant AIRDROP = 0xEEBA65fe884f493019A4616a1DeF196674FbA4AC;

  /// @param amount Amount in whole RAT tokens
  function run(uint256 amount) external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address sender = vm.addr(deployerPrivateKey);

    uint256 amountWithDecimals = amount * 1e18;

    console.log("Withdrawing from airdrop");
    console.log("Airdrop:", AIRDROP);
    console.log("Admin:", sender);
    console.log("Amount:", amount, "RAT");

    vm.startBroadcast(deployerPrivateKey);

    ERC20AirdropMerkleProof(AIRDROP).withdraw(amountWithDecimals);

    vm.stopBroadcast();

    console.log("Withdraw complete");
  }
}
