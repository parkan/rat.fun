import worlds from "../../../../contracts/worlds.json" with { type: "json" }
import { supportedChains } from "./supportedChains"

export async function getNetworkConfig(chainId: number, worldAddressOverride?: string) {
  const chainIndex = supportedChains.findIndex(c => c.id === chainId)
  const chain = supportedChains[chainIndex]
  if (!chain) {
    throw new Error(
      `Chain ${chainId} not supported. Supported chains: ${supportedChains.map(c => c.id).join(", ")}`
    )
  }

  const world = worlds[chain.id.toString() as keyof typeof worlds]
  const worldAddress = worldAddressOverride || world?.address
  if (!worldAddress) {
    throw new Error(`World address not found for chain ${chainId}. Set WORLD_ADDRESS env var.`)
  }

  const initialBlockNumber = (world as { blockNumber?: number })?.blockNumber ?? 0

  return {
    chainId,
    chain,
    worldAddress,
    initialBlockNumber,
    indexerUrl: chain.indexerUrl
  }
}
