import { base as baseConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"

const RPC_HTTP_URL = process.env.RPC_HTTP_URL
const RPC_WEBSOCKET_URL = process.env.RPC_WEBSOCKET_URL

console.log("RPC_HTTP_URL", RPC_HTTP_URL)
console.log("RPC_WEBSOCKET_URL", RPC_WEBSOCKET_URL)

export const extendedBase = {
  ...baseConfig,
  rpcUrls: {
    default: {
      http: RPC_HTTP_URL
        ? [RPC_HTTP_URL, ...baseConfig.rpcUrls.default.http]
        : baseConfig.rpcUrls.default.http,
      webSocket: RPC_WEBSOCKET_URL ? [RPC_WEBSOCKET_URL] : undefined
    }
  },
  indexerUrl: "https://base.rat-fun-indexer.com"
} as const satisfies MUDChain
