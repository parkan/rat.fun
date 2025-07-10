import { Chain, http, webSocket } from "viem"
import { anvil } from "viem/chains"
import { createWagmiConfig } from "@latticexyz/entrykit/internal"
import { garnet, pyrope, redstone } from "@latticexyz/common/chains"
import { baseSepolia } from "viem/chains"

export const chains = [
  redstone,
  garnet,
  pyrope,
  {
    ...baseSepolia,
    rpcUrls: {
      default: {
        http: ["https://api.pimlico.io/v2/84532/rpc?apikey=pim_8gQqpbnmKF1njADAZmuHy5"],
        webSocket: ["wss://api.pimlico.io/v2/84532/rpc?apikey=pim_8gQqpbnmKF1njADAZmuHy5"]
      }
    }
  },
  {
    ...anvil,
    contracts: {
      ...anvil.contracts,
      paymaster: {
        address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e"
      }
    },
    blockExplorers: {
      default: {} as never,
      worldsExplorer: {
        name: "MUD Worlds Explorer",
        url: "http://localhost:13690/anvil/worlds"
      }
    }
  }
] as const satisfies Chain[]

export const transports = {
  [anvil.id]: webSocket(),
  [garnet.id]: http(),
  [pyrope.id]: http(),
  [redstone.id]: http(),
  [baseSepolia.id]: http()
} as const

export const wagmiConfig = (chainId: number) =>
  createWagmiConfig({
    chainId,
    // TODO: swap this with another default project ID or leave empty
    walletConnectProjectId: "",
    appName: document.title,
    chains,
    transports,
    pollingInterval: {
      [anvil.id]: 2000,
      [garnet.id]: 2000,
      [pyrope.id]: 2000,
      [redstone.id]: 2000,
      [baseSepolia.id]: 2000
    }
  })
