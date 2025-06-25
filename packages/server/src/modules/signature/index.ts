import type { Hex } from "viem"
import { addressToId } from "@modules/signature/utils"
import { OFFCHAIN_VALIDATION_MESSAGE } from "@config"
import { recoverMessageAddress } from "viem"

export async function getSenderId(signature: Hex) {
  const recoveredAddress = await recoverMessageAddress({
    message: OFFCHAIN_VALIDATION_MESSAGE,
    signature
  })
  return addressToId(recoveredAddress)
}
