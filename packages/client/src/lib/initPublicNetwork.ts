import type { Hex } from "viem"
import { ENVIRONMENT } from "@ratfun/common/basic-network"
import { getNetworkConfig, setupPublicNetwork, SetupPublicNetworkResult } from "@ratfun/common/mud"
import { waitForChainSync } from "$lib/modules/chain-sync"
import { publicNetwork, ready, initBlockListener } from "$lib/modules/network"

interface InitPublicNetworkOptions {
  environment: ENVIRONMENT
  url: URL
}

interface InitPublicNetworkResult {
  publicClient: SetupPublicNetworkResult["publicClient"]
  transport: SetupPublicNetworkResult["transport"]
  worldAddress: Hex
}

/**
 * Initialize the public network connection and wait for chain sync to complete.
 * Sets up MUD layer, waits for indexer sync, and starts block listener.
 *
 * Returns the publicClient and transport for use by other systems (e.g. drawbridge).
 *
 * @param options.environment - The environment to connect to
 * @param options.url - The URL (for query params like worldAddress)
 */
export async function initPublicNetwork(
  options: InitPublicNetworkOptions
): Promise<InitPublicNetworkResult> {
  const { environment, url } = options

  // Setup MUD layer and store reference
  const networkConfig = getNetworkConfig(environment, url)
  const mudLayer = await setupPublicNetwork(networkConfig, import.meta.env.DEV)
  publicNetwork.set(mudLayer)

  // Wait for chain sync to complete (updates loading UI during sync)
  await waitForChainSync()

  // Mark as ready (for any components that need to check sync status)
  ready.set(true)

  // Start listening to block updates
  initBlockListener()

  // Return publicClient and transport for reuse by other systems
  return {
    publicClient: mudLayer.publicClient,
    transport: mudLayer.transport,
    worldAddress: mudLayer.worldAddress
  }
}
