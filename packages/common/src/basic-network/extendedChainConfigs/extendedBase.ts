import { base as baseConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"

export const extendedBase = {
  ...baseConfig,
  rpcUrls: {
    default: {
      http: ["https://base-mainnet.g.alchemy.com/v2/o0Q1hppQS1CH1vqg63edZ", ...baseConfig.rpcUrls.default.http],
      webSocket: ["wss://base-mainnet.g.alchemy.com/v2/-hnbjcqjwXmO7ip5cyHBh"]
    },
    bundler: {
      http: ["https://api.developer.coinbase.com/rpc/v1/base/nwWmepet0KAHsp8awdicqYG1g8KkrGWo"]
    }
  },
  indexerUrl: "https://base.rat-fun-indexer.com"
} as const satisfies MUDChain
