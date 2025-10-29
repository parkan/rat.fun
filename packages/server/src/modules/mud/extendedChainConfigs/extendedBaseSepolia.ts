import { baseSepolia as baseSepoliaConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"

const RPC_HTTP_URL = process.env.RPC_HTTP_URL
const RPC_WEBSOCKET_URL = process.env.RPC_WEBSOCKET_URL

export const extendedBaseSepolia = {
  ...baseSepoliaConfig,
  rpcUrls: {
    default: {
      http: RPC_HTTP_URL
        ? [RPC_HTTP_URL, ...baseSepoliaConfig.rpcUrls.default.http]
        : baseSepoliaConfig.rpcUrls.default.http,
      webSocket: RPC_WEBSOCKET_URL ? [RPC_WEBSOCKET_URL] : undefined
    }
  },
  indexerUrl: "https://base-sepolia.rat-fun-indexer.com"
} as const satisfies MUDChain
