// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ERC20AirdropMerkleProof } from "../src/external/ERC20AirdropMerkleProof.sol";

contract DeployERC20AirdropMerkleProof is Script {
  function run() external {
    if (block.chainid != 8453) {
      revert("Unrecognized chain, use base mainnet");
    }

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    // TODO use correct token and root
    address erc20 = 0xf2DD384662411A21259ab17038574289091F2D41;
    bytes32 merkleRoot = 0x6166741825cd30d2dff203e5296fb595935340aa700631d5cb9a78af7bbd07bd;

    ERC20AirdropMerkleProof airdrop = new ERC20AirdropMerkleProof(vm.addr(deployerPrivateKey), erc20, merkleRoot);
    console.log("deployed airdrop address: ", address(airdrop));

    vm.stopBroadcast();
  }
}
