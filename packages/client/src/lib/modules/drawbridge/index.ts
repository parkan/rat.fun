import {
  Drawbridge,
  DrawbridgeStatus,
  type SessionClient,
  type DrawbridgeState,
  type GasEstimates
} from "drawbridge"
import { readable, derived } from "svelte/store"
import { paymasters } from "./paymasters"
import { chains, transports, getConnectors } from "./wagmiConfig"
import type { Hex } from "viem"
import type { NetworkConfig } from "$lib/mud/utils"

// Re-export types from package
export type { ConnectorInfo, SessionClient, GasEstimates } from "drawbridge"
export { DrawbridgeStatus } from "drawbridge"

/**
 * Gas estimates for user operations
 * Based on gas-report.json with 1.3x safety multiplier
 * Keeps costs under Coinbase paymaster's $1 USD limit
 */
const gasEstimates: GasEstimates = {
  "0x59a5564c": 236000n, // spawn (181,844 × 1.3)
  "0x894ecc58": 587500n, // createRat (451,966 × 1.3)
  "0x4575ab44": 528000n, // liquidateRat (406,188 × 1.3)
  "0x2cb5f784": 312000n, // closeTrip (240,205 × 1.3)
  "0xd40d9ea6": 175000n // unlockAdmin (134,620 × 1.3)
}

// Drawbridge instance (singleton)
let drawbridgeInstance: InstanceType<typeof Drawbridge> | null = null

/**
 * Initialize Drawbridge - BLOCKING operation
 * Must be called once on app startup and awaited
 *
 * This will:
 * 1. Create Drawbridge instance with wagmi config
 * 2. Initialize Drawbridge (await reconnection, setup watchers)
 * 3. Return ready-to-use instance
 */
export async function initializeDrawbridge(networkConfig: NetworkConfig): Promise<void> {
  if (drawbridgeInstance) {
    console.log("[Drawbridge] Already initialized")
    return
  }

  console.log("[Drawbridge] Creating instance with network:", networkConfig.chainId)

  // Get chain-specific config
  const chain = chains.find(c => c.id === networkConfig.chainId)
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${networkConfig.chainId}`)
  }

  // Get connectors for this environment
  const connectors = getConnectors()
  console.log("[Drawbridge] Connectors from getConnectors():", connectors.length)

  // Create Drawbridge instance with wagmi config embedded
  drawbridgeInstance = new Drawbridge({
    chainId: networkConfig.chainId,
    chains: [chain] as const,
    transports,
    connectors,
    worldAddress: networkConfig.worldAddress as Hex,
    paymasterClient: paymasters[networkConfig.chainId],
    pollingInterval: 2000,
    appName: "RAT.FUN",
    gasEstimates
  })

  // Initialize (await reconnection, setup account watcher)
  await drawbridgeInstance.initialize()

  console.log("[Drawbridge] Instance ready")

  // Log available connectors for debugging
  const availableConnectors = drawbridgeInstance.getAvailableConnectors()
  console.log(
    "[Drawbridge] Available connectors after init:",
    availableConnectors.length,
    availableConnectors
  )
}

/**
 * Get Drawbridge instance (throws if not initialized)
 */
export function getDrawbridge(): InstanceType<typeof Drawbridge> {
  if (!drawbridgeInstance) {
    throw new Error("Drawbridge not initialized. Call initializeDrawbridge first.")
  }
  return drawbridgeInstance
}

/**
 * Cleanup Drawbridge (call on app unmount)
 */
export function cleanupDrawbridge(): void {
  if (drawbridgeInstance) {
    drawbridgeInstance.destroy()
    drawbridgeInstance = null
  }
}

// ===== Reactive Stores =====

export const drawbridgeState = readable<DrawbridgeState>(
  {
    status: DrawbridgeStatus.UNINITIALIZED,
    sessionClient: null,
    userAddress: null,
    sessionAddress: null,
    isReady: false,
    error: null
  },
  set => {
    // Subscribe when Drawbridge becomes available
    const interval = setInterval(() => {
      if (drawbridgeInstance) {
        clearInterval(interval)
        const unsubscribe = drawbridgeInstance.subscribe(set)
        return unsubscribe
      }
    }, 100)

    return () => clearInterval(interval)
  }
)

// Convenience stores
export const status = derived(drawbridgeState, $state => $state.status)
export const sessionClient = derived<typeof drawbridgeState, SessionClient | null>(
  drawbridgeState,
  $state => $state?.sessionClient ?? null
)
export const userAddress = derived(drawbridgeState, $state => $state?.userAddress ?? null)
export const sessionAddress = derived(drawbridgeState, $state => $state?.sessionAddress ?? null)
export const isSessionReady = derived(drawbridgeState, $state => $state?.isReady ?? false)
export const drawbridgeError = derived(drawbridgeState, $state => $state?.error ?? null)

// Derived store to check if session setup is needed
export const needsSessionSetup = derived(
  drawbridgeState,
  $state => $state.sessionClient !== null && !$state.isReady
)
