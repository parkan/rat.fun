import { baseSepolia as baseSepoliaConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"

export const extendedBaseSepolia = {
  ...baseSepoliaConfig,
  rpcUrls: {
    default: {
      http: ["https://base-sepolia.g.alchemy.com/v2/-hnbjcqjwXmO7ip5cyHBh", ...baseSepoliaConfig.rpcUrls.default.http],
      webSocket: ["wss://base-sepolia.g.alchemy.com/v2/-hnbjcqjwXmO7ip5cyHBh"]
    },
    bundler: {
      http: ["https://api.developer.coinbase.com/rpc/v1/base-sepolia/nwWmepet0KAHsp8awdicqYG1g8KkrGWo"]
    }
  },
  indexerUrl: "https://base-sepolia.rat-fun-indexer.com"
} as const satisfies MUDChain
