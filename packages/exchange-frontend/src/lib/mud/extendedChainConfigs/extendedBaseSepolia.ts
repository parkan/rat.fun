import { baseSepolia as baseSepoliaConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"
import { PUBLIC_BASE_SEPOLIA_RPC_URL } from "$env/static/public"

export const extendedBaseSepolia = {
  ...baseSepoliaConfig,
  rpcUrls: {
    default: {
      http: [PUBLIC_BASE_SEPOLIA_RPC_URL, ...baseSepoliaConfig.rpcUrls.default.http]
    }
  },
  indexerUrl: "https://base-sepolia.rat-fun-indexer.com"
} as const satisfies MUDChain
