import type { Hex, WalletClient, Chain, Transport, PrivateKeyAccount } from "viem"
import type { SignedRequest, SignedRequestInfo } from "../../types"

/**
 * Sign a request for the server API
 * Adapted from packages/client/src/lib/modules/signature/index.ts
 */
export async function signRequest<T>(
  data: T,
  walletClient: WalletClient<Transport, Chain, PrivateKeyAccount>
): Promise<SignedRequest<T>> {
  const info: SignedRequestInfo = {
    timestamp: Date.now(),
    nonce: Math.floor(Math.random() * 1e12),
    calledFrom: null // Bot uses direct wallet, not delegation
  }

  const message = JSON.stringify({ data, info })

  const signature = await walletClient.signMessage({
    message
  })

  return {
    data,
    info,
    signature: signature as Hex
  }
}
