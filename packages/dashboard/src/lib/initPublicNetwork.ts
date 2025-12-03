import { ENVIRONMENT } from "@ratfun/common/basic-network"
import { getNetworkConfig, setupPublicNetwork } from "@ratfun/common/mud"
import { createSyncProgressSystem } from "$lib/modules/chain-sync"
import { publicNetwork, initBlockListener } from "$lib/modules/network"

export async function initPublicNetwork(environment: ENVIRONMENT, url: URL) {
  // Get network config and setup MUD layer
  const networkConfig = getNetworkConfig(environment, url)
  const mudLayer = await setupPublicNetwork(networkConfig, import.meta.env.DEV)

  publicNetwork.set(mudLayer)

  // Listen to changes to the SyncProgress component
  createSyncProgressSystem()

  // Write block numbers to svelte store and alert on lost connection
  initBlockListener()
}
