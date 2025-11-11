import { Chain, parseErc6492Signature } from "viem"
import { writeContract as viem_writeContract } from "viem/actions"
import { getAction } from "viem/utils"
import { SignCallOptions, signCall } from "./signCall"
import CallWithSignatureAbi from "@latticexyz/world-module-callwithsignature/out/CallWithSignatureSystem.sol/CallWithSignatureSystem.abi.json"
import { ConnectedClient } from "../core/types"

export type CallWithSignatureOptions<chain extends Chain = Chain> = SignCallOptions<chain> & {
  sessionClient: ConnectedClient
}

/**
 * Call a World system using signature-based execution (for EOAs)
 *
 * MUD's CallWithSignature pattern allows EOAs to execute gasless transactions:
 *
 * 1. User signs an EIP-712 message (free, off-chain)
 * 2. Session account submits the signature + call to World
 * 3. World's CallWithSignatureSystem validates the signature
 * 4. If valid, executes the call as the user (with user's identity)
 *
 * This enables gasless transactions for EOAs - the session account pays gas
 * via paymaster, but the call executes with the user's permissions/identity.
 *
 * Flow:
 *   User (EOA) → signs message → Session Account → submits to World
 *   → World validates signature → executes as User
 *
 * @param options Call parameters including user client and session client
 * @returns Transaction hash
 * @throws If ERC-6492 signature detected (not yet supported)
 */
export async function callWithSignature<chain extends Chain = Chain>({
  sessionClient,
  ...opts
}: CallWithSignatureOptions<chain>) {
  // Get user's signature on the call
  const rawSignature = await signCall(opts)

  // Check for ERC-6492 wrapped signatures (e.g., from Coinbase Smart Wallet)
  // These aren't yet supported by CallWithSignature module
  const { address, signature } = parseErc6492Signature(rawSignature)
  if (address != null) {
    throw new Error(
      "ERC-6492 signatures, like from Coinbase Smart Wallet, are not yet supported. Try using a different wallet?"
    )
  }

  // Session account submits the signature + call to World
  return getAction(
    sessionClient,
    viem_writeContract,
    "writeContract"
  )({
    address: opts.worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    args: [opts.userClient.account.address, opts.systemId, opts.callData, signature]
  } as never)
}
