import { writable } from "svelte/store"
import { SetupPublicNetworkResult } from "@ratfun/common/mud"
import { ENVIRONMENT, SALE_STATUS } from "@ratfun/common/basic-network"

// ----------------------------------------------------------------------------

export { initBlockListener } from "./blockListener"

// --- STORES -----------------------------------------------------------------

export const publicNetwork = writable({} as SetupPublicNetworkResult)
export const blockNumber = writable(BigInt(0))
export const ready = writable(false)
export const loadingMessage = writable("Loading started")
export const loadingPercentage = writable(0)

export const environment = writable<ENVIRONMENT>(ENVIRONMENT.UNKNOWN)
export const saleStatus = writable<SALE_STATUS>(SALE_STATUS.UNKNOWN)

// ----------------------------------------------------------------------------
/**
 * Get the chain/environment the client is accessing from the URL
 * Should only be called once per session.
 * @param url - The URL the client is accessed on
 * @returns The chain/environment the client is accessing
 */
export const getEnvironmentFromUrl = (url: URL) => {
  const hostname = url.hostname
  const networkParam = url.searchParams.get("network")

  if (hostname === "dashboard.rat.fun" || networkParam === "base") {
    return ENVIRONMENT.BASE
  } else if (hostname === "dashboard-base-sepolia.rat.fun" || networkParam === "base-sepolia") {
    return ENVIRONMENT.BASE_SEPOLIA
  } else {
    return ENVIRONMENT.DEVELOPMENT
  }
}
