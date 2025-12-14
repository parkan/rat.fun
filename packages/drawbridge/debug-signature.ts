/**
 * Debug script to compute EIP-712 hashes client-side
 *
 * Run with: npx tsx debug-signature.ts
 *
 * Compare output with the Solidity DebugSignature.s.sol script
 */

import { keccak256, encodeAbiParameters, encodePacked, toHex, concat, hexToBytes } from "viem"

// Inputs - fill these in from the logs
const worldAddress = "0x28d10E6aAb1a749Be792b4D8aa0519c70E83386a"
const signer = "0xa34f0A5c90e44A2e19c5454C95996a39BaCb815B"
const systemId = "0x73790000000000000000000000000000526567697374726174696f6e00000000"
const callData =
  "0x1d2257ba000000000000000000000000119ef8981d7c8b5c4c3a8ec1b6117e52e6cbb6da73790000000000000000000000000000756e6c696d697465640000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000"
const nonce = 0n
const chainId = 8453n
const signature =
  "0xba37d4096bb67ba34594df453df9e37c1c9763a4a858b5485ba98fb1c8c9ec2601688e2572be230adea34a9da5fd8e85611958fa7be935522dcf78dbafd24a1f1c" // Fill from logs

// Parse systemId to get namespace and name
function parseSystemId(systemId: string): { namespace: string; name: string } {
  // systemId format: 0x + 2 bytes type + 14 bytes namespace + 16 bytes name
  // Type "sy" = 0x7379 for system
  const bytes = hexToBytes(systemId as `0x${string}`)

  // Namespace is bytes 2-16 (14 bytes)
  const namespaceBytes = bytes.slice(2, 16)
  // Name is bytes 16-32 (16 bytes)
  const nameBytes = bytes.slice(16, 32)

  // Trim trailing zeros and convert to string
  const namespace = new TextDecoder().decode(namespaceBytes).replace(/\0+$/, "")
  const name = new TextDecoder().decode(nameBytes).replace(/\0+$/, "")

  return { namespace, name }
}

console.log("=== Debug CallWithSignatureAlt (Client-Side) ===\n")

// Log inputs
console.log("Inputs:")
console.log("  worldAddress:", worldAddress)
console.log("  signer:", signer)
console.log("  systemId:", systemId)
console.log("  callData length:", (callData.length - 2) / 2, "bytes")
console.log("  nonce:", nonce.toString())
console.log("  chainId:", chainId.toString())
console.log("")

// Parse systemId
const { namespace: systemNamespace, name: systemName } = parseSystemId(systemId)
console.log("Parsed SystemId:")
console.log("  systemNamespace:", `"${systemNamespace}"`)
console.log("  systemNamespace length:", systemNamespace.length)
console.log("  systemName:", `"${systemName}"`)
console.log("  systemName length:", systemName.length)
console.log("")

// Compute domain typehash
const DOMAIN_TYPEHASH = keccak256(
  encodePacked(
    ["string"],
    ["EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"]
  )
)

// Compute call typehash
const CALL_TYPEHASH = keccak256(
  encodePacked(
    ["string"],
    ["Call(address signer,string systemNamespace,string systemName,bytes callData,uint256 nonce)"]
  )
)

// Compute name and version hashes
const nameHash = keccak256(encodePacked(["string"], ["CallWithSignatureAlt"]))
const versionHash = keccak256(encodePacked(["string"], ["1"]))

console.log("Domain Components:")
console.log("  DOMAIN_TYPEHASH:", DOMAIN_TYPEHASH)
console.log("  nameHash (keccak256('CallWithSignatureAlt')):", nameHash)
console.log("  versionHash (keccak256('1')):", versionHash)
console.log("  chainId:", chainId.toString())
console.log("  verifyingContract:", worldAddress)
console.log("")

// Compute domain separator
const domainSeparator = keccak256(
  encodeAbiParameters(
    [
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint256" },
      { type: "address" }
    ],
    [DOMAIN_TYPEHASH, nameHash, versionHash, chainId, worldAddress as `0x${string}`]
  )
)
console.log("Domain Separator:", domainSeparator)
console.log("")

// Compute struct hash components
const namespaceHash = keccak256(encodePacked(["string"], [systemNamespace]))
const nameHashStruct = keccak256(encodePacked(["string"], [systemName]))
const callDataHash = keccak256(callData as `0x${string}`)

console.log("Message Components:")
console.log("  CALL_TYPEHASH:", CALL_TYPEHASH)
console.log("  signer:", signer)
console.log("  namespaceHash (keccak256(systemNamespace)):", namespaceHash)
console.log("  nameHash (keccak256(systemName)):", nameHashStruct)
console.log("  callDataHash (keccak256(callData)):", callDataHash)
console.log("  nonce:", nonce.toString())
console.log("")

// Compute struct hash
const structHash = keccak256(
  encodeAbiParameters(
    [
      { type: "bytes32" },
      { type: "address" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint256" }
    ],
    [CALL_TYPEHASH, signer as `0x${string}`, namespaceHash, nameHashStruct, callDataHash, nonce]
  )
)
console.log("Struct Hash:", structHash)
console.log("")

// Compute final message hash
const messageHash = keccak256(concat(["0x1901", domainSeparator, structHash]))
console.log("Final Message Hash:", messageHash)
console.log("")

// Try to recover signer (for comparison)
console.log("=== Signature Analysis ===")
console.log("Signature:", signature)
if (signature && signature.length === 132) {
  const r = signature.slice(0, 66)
  const s = "0x" + signature.slice(66, 130)
  const v = parseInt(signature.slice(130, 132), 16)
  console.log("  r:", r)
  console.log("  s:", s)
  console.log("  v:", v)
}
console.log("")

console.log("=== Compare with Solidity Output ===")
console.log("Run the Solidity script and compare these values:")
console.log("  Domain Separator:", domainSeparator)
console.log("  Struct Hash:", structHash)
console.log("  Message Hash:", messageHash)
