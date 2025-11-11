import { EntryKit } from "@latticexyz/entrykit"
import { readable, derived, writable } from "svelte/store"
import { getNetworkConfig } from "$lib/mud/getNetworkConfig"
import { environment } from "$lib/modules/network"
import { get } from "svelte/store"
import { paymasters } from "./paymasters"
import { wagmiConfig as createWagmiConfig } from "./wagmiConfig"
import type { Hex } from "viem"
import type { Config } from "wagmi"

// Get network config
const env = get(environment)
const networkConfig = getNetworkConfig(
  env,
  typeof window !== "undefined" ? window.location : (undefined as any)
)

// Create singleton EntryKit instance
export const entrykit = new EntryKit({
  chainId: networkConfig.chainId,
  worldAddress: networkConfig.worldAddress as Hex,
  paymasterClient: paymasters[networkConfig.chainId]
})

// Create reactive Svelte stores
export const entrykitState = readable(entrykit.getState(), set => entrykit.subscribe(set))

// Convenience stores (replaces entryKitSession)
export const sessionClient = derived(entrykitState, $state => $state.sessionClient)
export const userAddress = derived(entrykitState, $state => $state.userAddress)
export const sessionAddress = derived(entrykitState, $state => $state.sessionAddress)
export const isSessionReady = derived(entrykitState, $state => $state.isReady)

// Wagmi config (replaces wagmiConfigStateful)
export const wagmiConfig = writable<Config | null>(createWagmiConfig(networkConfig.chainId))
