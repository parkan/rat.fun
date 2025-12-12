// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

using WorldResourceIdInstance for ResourceId;

contract DebugSignature is Script {
  bytes32 constant DOMAIN_TYPEHASH =
    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 constant CALL_TYPEHASH =
    keccak256("Call(address signer,string systemNamespace,string systemName,bytes callData,uint256 nonce)");

  function run(
    address worldAddress,
    address signer,
    bytes32 systemId,
    bytes calldata callData,
    uint256 nonce,
    bytes calldata signature
  ) external view {
    console.log("=== Debug CallWithSignatureAlt ===");

    // Compute and log hashes
    bytes32 domainSeparator = _computeDomainSeparator(worldAddress);
    console.log("Domain Separator:", vm.toString(domainSeparator));

    bytes32 structHash = _computeStructHash(signer, systemId, callData, nonce);
    console.log("Struct Hash:", vm.toString(structHash));

    bytes32 messageHash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    console.log("Message Hash:", vm.toString(messageHash));

    // Recover signer
    if (signature.length == 65) {
      address recovered = ECDSA.recover(messageHash, signature);
      console.log("Recovered:", recovered);
      console.log("Expected:", signer);
      console.log("Match:", recovered == signer);
    }
  }

  function _computeDomainSeparator(address worldAddress) internal view returns (bytes32) {
    return
      keccak256(
        abi.encode(
          DOMAIN_TYPEHASH,
          keccak256(bytes("CallWithSignatureAlt")),
          keccak256(bytes("1")),
          uint256(block.chainid),
          worldAddress
        )
      );
  }

  function _computeStructHash(
    address signer,
    bytes32 systemId,
    bytes calldata callData,
    uint256 nonce
  ) internal pure returns (bytes32) {
    ResourceId resourceId = ResourceId.wrap(systemId);
    string memory ns = WorldResourceIdLib.toTrimmedString(resourceId.getNamespace());
    string memory name = WorldResourceIdLib.toTrimmedString(resourceId.getName());

    return
      keccak256(
        abi.encode(
          CALL_TYPEHASH,
          signer,
          keccak256(abi.encodePacked(ns)),
          keccak256(abi.encodePacked(name)),
          keccak256(callData),
          nonce
        )
      );
  }
}
