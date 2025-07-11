import { base as baseConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"

export const base = {
  ...baseConfig,
  indexerUrl: "https://base.rat-fun-indexer.com"
} as const satisfies MUDChain
