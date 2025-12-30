import { get } from "svelte/store"
import { publicNetwork, loadingMessage, loadingPercentage } from "$lib/modules/network"
import { SyncStep } from "@latticexyz/store-sync"
import { createLogger } from "$lib/modules/logger"

const logger = createLogger("waitForChainSync")

const SYNC_TIMEOUT_MS = 30000 // 30 seconds timeout

/**
 * Waits for MUD chain sync to complete.
 * Updates loading UI stores during sync progress.
 * Returns a Promise that resolves when sync reaches LIVE state.
 * Includes a timeout to prevent infinite hangs (e.g., Firefox-specific issues).
 */
export function waitForChainSync(): Promise<void> {
  return new Promise((resolve, reject) => {
    let hasCompleted = false

    // Set timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      if (!hasCompleted) {
        hasCompleted = true
        subscription.unsubscribe()
        logger.error(`Chain sync timeout after ${SYNC_TIMEOUT_MS}ms`)
        reject(new Error(`Chain sync timeout after ${SYNC_TIMEOUT_MS}ms`))
      }
    }, SYNC_TIMEOUT_MS)

    const subscription = get(publicNetwork).components.SyncProgress.update$.subscribe(update => {
      if (hasCompleted) return

      const currentValue = update.value[0]

      if (!currentValue) {
        hasCompleted = true
        clearTimeout(timeoutId)
        subscription.unsubscribe()
        logger.error("Sync error - no value")
        reject(new Error("Sync error"))
        return
      }

      loadingMessage.set(currentValue.message ?? "Loading")
      loadingPercentage.set(Number(currentValue.percentage.toFixed(0) ?? 0))

      // Sync complete - resolve and clean up
      if (currentValue.step === SyncStep.LIVE) {
        hasCompleted = true
        clearTimeout(timeoutId)
        subscription.unsubscribe()
        logger.log("Sync complete")
        resolve()
      }
    })
  })
}
