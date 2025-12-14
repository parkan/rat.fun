import { get } from "svelte/store"
import { publicNetwork, blockNumber } from "./index"
import { errorHandler, BlockTimeoutError } from "$lib/modules/error-handling"

let blockTimeout: number
const TIMEOUT = 60000

export function initBlockListener() {
  get(publicNetwork).latestBlock$.subscribe(block => {
    // Guard against undefined block (can happen during RPC issues)
    if (!block) return

    // console.log("block", Number(block.number), block)
    // Show a error message if we haven't received a block in a while
    clearTimeout(blockTimeout)
    blockTimeout = window.setTimeout(() => errorHandler(new BlockTimeoutError()), TIMEOUT)
    // For convenience, we store the block number in a svelte store
    blockNumber.set(block.number ?? BigInt(0))
  })
}
