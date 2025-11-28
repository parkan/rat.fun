import { Hex, recoverMessageAddress } from "viem"
import { SignedRequest, SignedRequestInfo } from "@modules/types"
import { hasNonce, storeNonce } from "@modules/nonce-store"
import { addressToId } from "@modules/signature/utils"
import { REQUEST_SIGNATURE_TIMEOUT_MS } from "@config"
import { StaleRequestError, NonceUsedError } from "@modules/error-handling/errors"

/**
 * Stringify request for signature verification.
 * Must match the client-side signing format exactly.
 */
function stringifyRequestForSignature({ data, info }: { data: unknown; info: SignedRequestInfo }) {
  return JSON.stringify({ data, info })
}

/**
 * Verify the request timeout, nonce and signature,
 * optionally use the calledFrom address if provided (delegation trusted without on-chain verification),
 * and return the caller address converted to player id.
 * @returns callerAddress signer or delegator player id.
 */
export async function verifyRequest<T>(signedRequest: SignedRequest<T>): Promise<Hex> {
  const { data, info, signature } = signedRequest

  const recoveredAddress = await recoverMessageAddress({
    message: stringifyRequestForSignature({ data, info }),
    signature
  })
  let callerAddress: Hex = recoveredAddress

  // Check timeout
  if (Date.now() - info.timestamp > REQUEST_SIGNATURE_TIMEOUT_MS) {
    throw new StaleRequestError()
  }

  // Check nonce, and store it to prevent replay attacks during the timeout window
  if (await hasNonce(info.nonce)) {
    throw new NonceUsedError()
  }
  await storeNonce(info.nonce)

  // Use calledFrom address if provided (delegation trusted without on-chain verification)
  if (info.calledFrom) {
    callerAddress = info.calledFrom
  }

  return addressToId(callerAddress) as Hex
}
