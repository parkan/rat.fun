import { baseSepolia as baseSepoliaConfig } from "viem/chains"
import { type MUDChain } from "@latticexyz/common/chains"

export const extendedBaseSepolia = {
  ...baseSepoliaConfig,
  rpcUrls: {
    default: {
      http: [
        "https://base-sepolia.g.alchemy.com/v2/3--gazgbtdp7YdVU6sigj",
        ...baseSepoliaConfig.rpcUrls.default.http
      ]
    },
    bundler: {
      http: ["https://api.pimlico.io/v2/84532/rpc?apikey=pim_8gQqpbnmKF1njADAZmuHy5"]
    }
  },
  indexerUrl: "https://base-sepolia.rat-fun-indexer.com",
  faucetUrl: "https://pyrope-faucet.jimmy9-infra.com/trpc/drip"
} as const satisfies MUDChain
