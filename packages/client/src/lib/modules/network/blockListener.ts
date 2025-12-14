import { get } from "svelte/store"
import { publicNetwork, blockNumber } from "./index"
import { errorHandler, BlockTimeoutError } from "$lib/modules/error-handling"

let blockTimeout: number
const TIMEOUT = 60000

export function initBlockListener() {
  get(publicNetwork).latestBlock$.subscribe({
    next: block => {
      // Guard against undefined block (can happen during RPC issues)
      if (!block?.number) return

      // Show a error message if we haven't received a block in a while
      clearTimeout(blockTimeout)
      blockTimeout = window.setTimeout(() => errorHandler(new BlockTimeoutError()), TIMEOUT)
      // For convenience, we store the block number in a svelte store
      blockNumber.set(block.number)
    },
    error: err => {
      // Log and recover from errors in the MUD observable pipeline
      // This can happen when RPC returns undefined blocks during rate limiting
      console.warn("[BlockListener] Error in block observable:", err)
    }
  })
}
