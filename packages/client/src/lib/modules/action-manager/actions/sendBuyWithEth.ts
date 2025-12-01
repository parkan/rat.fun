import { buyWithEth } from "$lib/modules/on-chain-transactions"
import { busy } from "../index.svelte"
import { TransactionError } from "@ratfun/common/error-handling"

/**
 * Buy tokens with ETH
 *
 */
export async function sendBuyWithEth() {
  if (busy.BuyWithEth.current !== 0) return
  busy.BuyWithEth.set(0.99)

  try {
    // Try to buy 1 token (1e18 wei = 1 full token)
    await buyWithEth(1 * 1e18, "US")
  } catch (e) {
    throw new TransactionError("Failed buy tokens with ETH", e)
  } finally {
    busy.BuyWithEth.set(0, { duration: 0 })
  }
}
