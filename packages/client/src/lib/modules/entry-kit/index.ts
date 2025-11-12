import { EntryKit } from "entrykit-drawbridge"
import { readable, derived, writable } from "svelte/store"
import { paymasters } from "./paymasters"
import { wagmiConfig as createWagmiConfig } from "./wagmiConfig"
import { reconnect, getConnectorClient } from "@wagmi/core"
import { get } from "svelte/store"
import type { Hex, Address } from "viem"
import type { Config } from "wagmi"
import type { NetworkConfig } from "$lib/mud/utils"

// Temporary type for EntryKit state
// TODO: fix type exports from entrykit-drawbridge
type EntryKitState = {
  sessionClient: SessionClientLike | null
  userAddress: Address | null
  sessionAddress: Address | null
  isReady: boolean
}

type SessionClientLike = {
  account: {
    address: Address
  }
}

// EntryKit instance (created lazily when network config is available)
let entrykitInstance: InstanceType<typeof EntryKit> | null = null

// Initialize EntryKit with network config
export function initializeEntryKit(networkConfig: NetworkConfig) {
  if (entrykitInstance) {
    // Already initialized
    return entrykitInstance
  }

  console.log("[EntryKit] Initializing with network:", networkConfig.chainId)

  entrykitInstance = new EntryKit({
    chainId: networkConfig.chainId,
    worldAddress: networkConfig.worldAddress as Hex,
    paymasterClient: paymasters[networkConfig.chainId]
  })

  // Update wagmi config
  const config = createWagmiConfig(networkConfig.chainId)
  wagmiConfig.set(config)

  // Reconnect to previously connected wallet if available
  reconnect(config).catch(error => {
    console.log("[EntryKit] No previous connection to restore:", error.message)
  })

  return entrykitInstance
}

// Get EntryKit instance (throws if not initialized)
export function getEntryKit(): InstanceType<typeof EntryKit> {
  if (!entrykitInstance) {
    throw new Error("EntryKit not initialized. Call initializeEntryKit first.")
  }
  return entrykitInstance
}

// Create reactive Svelte stores
// These will be empty until EntryKit is initialized

export const entrykitState = readable<EntryKitState>(
  { sessionClient: null, userAddress: null, sessionAddress: null, isReady: false },
  set => {
    // Subscribe when EntryKit becomes available
    const interval = setInterval(() => {
      if (entrykitInstance) {
        clearInterval(interval)
        const unsubscribe = entrykitInstance.subscribe(set)
        return unsubscribe
      }
    }, 100)

    return () => clearInterval(interval)
  }
)

// Convenience stores
export const sessionClient = derived<typeof entrykitState, SessionClientLike | null>(
  entrykitState,
  $state => $state?.sessionClient ?? null
)
export const userAddress = derived(entrykitState, $state => $state?.userAddress ?? null)
export const sessionAddress = derived(entrykitState, $state => $state?.sessionAddress ?? null)
export const isSessionReady = derived(entrykitState, $state => $state?.isReady ?? false)

// Wagmi config (will be set when EntryKit initializes)
export const wagmiConfig = writable<Config | null>(null)

/**
 * Manually trigger session setup (delegation registration)
 * This should be called after wallet is connected but session is not ready
 */
export async function setupEntryKitSession(): Promise<void> {
  const entrykit = getEntryKit()
  const config = get(wagmiConfig)

  if (!config) {
    throw new Error("Wagmi config not available")
  }

  // Get the current wallet client
  const walletClient = await getConnectorClient(config)

  console.log("[EntryKit] Setting up session (registering delegation)...")
  await entrykit.setupSession(walletClient)

  // Verify setup completed
  console.log("[EntryKit] Verifying setup...")
  const verified = await entrykit.checkPrerequisites()
  console.log("[EntryKit] Setup verified:", verified)

  if (!verified.isReady) {
    throw new Error("Session setup failed - delegation not registered")
  }

  console.log("[EntryKit] Session setup complete!")
}

// Derived store to check if session setup is needed
export const needsSessionSetup = derived(
  entrykitState,
  $state => $state.sessionClient !== null && !$state.isReady
)
