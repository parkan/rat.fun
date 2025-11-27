import type { Hex } from "viem"
import type { Config } from "./types"

export function getServerUrl(chainId: number): string {
  switch (chainId) {
    case 8453:
      return "https://base.rat.fun"
    case 84532:
      return "https://base-sepolia.rat.fun"
    default:
      return "http://localhost:3131"
  }
}

export function loadConfig(opts: {
  chain?: string
  selector?: string
  autoRespawn?: boolean
  name?: string
}): Config {
  const chainId = Number(opts.chain || process.env.CHAIN_ID || "84532")

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required")
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required")
  }

  return {
    privateKey: privateKey as Hex,
    anthropicApiKey,
    chainId,
    serverUrl: process.env.SERVER_URL || getServerUrl(chainId),
    tripSelector: (opts.selector || process.env.TRIP_SELECTOR || "claude") as
      | "claude"
      | "heuristic",
    autoRespawn: opts.autoRespawn ?? process.env.AUTO_RESPAWN === "true",
    ratName: opts.name || process.env.RAT_NAME || "RattusBot",
    worldAddress: process.env.WORLD_ADDRESS,
    rpcHttpUrl: process.env.RPC_HTTP_URL
  }
}
