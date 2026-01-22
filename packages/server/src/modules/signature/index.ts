import { Hex, recoverMessageAddress } from "viem"
import { SignedRequest } from "@modules/types"
import { hasDelegation } from "@modules/mud/getOnchainData/hasDelegation"
import { storeNonceIfNew } from "@modules/signature/db"
import { addressToId } from "@modules/utils"
import { stringifyRequestForSignature } from "@modules/signature/stringifyRequestForSignature"
import { deriveSessionAccount } from "@modules/signature/deriveSessionAccount"
import { REQUEST_SIGNATURE_TIMEOUT_MS } from "@config"
import {
  StaleRequestError,
  NonceUsedError,
  DelegationNotFoundError
} from "@modules/error-handling/errors"

/**
 * Verify the request timeout, nonce and signature,
 * optionally substitute the call signer address for `callFrom`,
 * and return the caller address converted to id.
 * @param signedRequest - The signed request to verify.
 * @returns callerAddress and playerId.
 */
export async function verifyRequest<T>(
  signedRequest: SignedRequest<T>
): Promise<{ callerAddress: Hex; playerId: Hex }> {
  const recoveredAddress = await recoverMessageAddress({
    message: stringifyRequestForSignature(signedRequest),
    signature: signedRequest.signature
  })
  let callerAddress: Hex = recoveredAddress

  // Check timeout
  if (Date.now() - signedRequest.info.timestamp > REQUEST_SIGNATURE_TIMEOUT_MS) {
    throw new StaleRequestError()
  }

  // Atomically check and store nonce to prevent replay attacks.
  // This prevents race conditions where concurrent requests with the same nonce
  // could both pass a non-atomic check-then-store.
  const nonceIsNew = await storeNonceIfNew(signedRequest.info.nonce)
  if (!nonceIsNew) {
    throw new NonceUsedError()
  }

  // Check delegation and substitute playerAddress if necessary
  if (signedRequest.info.calledFrom) {
    // The recovered address is the signer (EOA), but delegation is registered
    // for the session smart account. Derive the smart account from the signer.
    const sessionAccount = await deriveSessionAccount(recoveredAddress)

    if (!(await hasDelegation(signedRequest.info.calledFrom, sessionAccount))) {
      throw new DelegationNotFoundError()
    }
    callerAddress = signedRequest.info.calledFrom
  }

  const playerId = addressToId(callerAddress) as Hex

  return { callerAddress, playerId }
}
