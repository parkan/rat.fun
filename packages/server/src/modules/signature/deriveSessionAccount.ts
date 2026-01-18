import { Hex } from "viem"
import { network } from "@modules/mud/initMud"

/**
 * SimpleAccountFactory address (EntryPoint v0.7)
 * This is the standard factory used by permissionless/viem for ERC-4337 SimpleAccounts
 */
const SIMPLE_ACCOUNT_FACTORY = "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985"

/**
 * Derive the SimpleAccount (ERC-4337) address from an owner address.
 *
 * The session wallet architecture uses:
 * - A signer (EOA) that signs messages
 * - A smart account (SimpleAccount) that the signer controls
 * - Delegation registered for the smart account, not the signer
 *
 * When verifying requests, we recover the signer from the signature,
 * then derive the smart account to check delegation.
 *
 * @param owner - The owner/signer address
 * @param salt - Optional salt (defaults to 0)
 * @returns The derived SimpleAccount address
 */
export async function deriveSessionAccount(owner: Hex, salt: bigint = 0n): Promise<Hex> {
  const accountAddress = await network.publicClient.readContract({
    address: SIMPLE_ACCOUNT_FACTORY,
    abi: [
      {
        name: "getAddress",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "owner", type: "address" },
          { name: "salt", type: "uint256" }
        ],
        outputs: [{ type: "address" }]
      }
    ],
    functionName: "getAddress",
    args: [owner, salt]
  })

  return accountAddress as Hex
}
