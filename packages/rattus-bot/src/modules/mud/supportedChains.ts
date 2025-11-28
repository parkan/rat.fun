import { base as baseConfig, baseSepolia as baseSepoliaConfig } from "viem/chains"
import { MUDChain, mudFoundry } from "@latticexyz/common/chains"

const RPC_HTTP_URL = process.env.RPC_HTTP_URL

export const extendedBase = {
  ...baseConfig,
  rpcUrls: {
    default: {
      http: RPC_HTTP_URL
        ? [RPC_HTTP_URL, ...baseConfig.rpcUrls.default.http]
        : baseConfig.rpcUrls.default.http,
      webSocket: undefined
    }
  },
  indexerUrl: "https://base.rat-fun-indexer.com"
} as const satisfies MUDChain

export const extendedBaseSepolia = {
  ...baseSepoliaConfig,
  rpcUrls: {
    default: {
      http: RPC_HTTP_URL
        ? [RPC_HTTP_URL, ...baseSepoliaConfig.rpcUrls.default.http]
        : baseSepoliaConfig.rpcUrls.default.http,
      webSocket: undefined
    }
  },
  indexerUrl: "https://base-sepolia.rat-fun-indexer.com"
} as const satisfies MUDChain

export const supportedChains: MUDChain[] = [mudFoundry, extendedBase, extendedBaseSepolia]
