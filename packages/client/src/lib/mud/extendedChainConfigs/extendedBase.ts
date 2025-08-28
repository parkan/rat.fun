import { base as baseConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"

export const extendedBase = {
  ...baseConfig,
  rpcUrls: {
    default: {
      http: [
        "https://base-mainnet.g.alchemy.com/v2/3--gazgbtdp7YdVU6sigj",
        ...baseConfig.rpcUrls.default.http
      ]
    }
  },
  indexerUrl: "https://base.rat-fun-indexer.com"
} as const satisfies MUDChain
