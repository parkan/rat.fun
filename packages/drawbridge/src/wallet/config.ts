import { Chain, Transport } from "viem"
import { createConfig, createStorage, type Config, type CreateConnectorFn } from "@wagmi/core"

/**
 * Configuration parameters for creating wagmi config
 */
export type WalletConfigParams = {
  /** Supported chains */
  chains: readonly [Chain, ...Chain[]]
  /** Transport configuration per chain */
  transports: Record<number, Transport>
  /** Wallet connectors (injected, walletConnect, etc.) */
  connectors: CreateConnectorFn[]
  /** Optional polling interval in milliseconds */
  pollingInterval?: number
}

/**
 * Create wagmi configuration for wallet connection
 *
 * Configures wagmi with:
 * - Chains and transports for RPC communication
 * - Wallet connectors (MetaMask, WalletConnect, Coinbase, etc.)
 * - localStorage persistence for connection state
 * - Optional polling interval for state updates
 *
 * @param params Configuration parameters
 * @returns Wagmi Config instance
 */
export function createWalletConfig({
  chains,
  transports,
  connectors,
  pollingInterval
}: WalletConfigParams): Config {
  return createConfig({
    chains,
    transports,
    connectors,
    pollingInterval,
    storage: createStorage({
      storage: typeof window !== "undefined" ? window.localStorage : undefined
    })
  })
}
