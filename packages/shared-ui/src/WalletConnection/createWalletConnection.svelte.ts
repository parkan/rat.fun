import type { Drawbridge, ConnectorInfo } from "drawbridge"

export type WalletConnectionOptions = {
  /**
   * Function to get the Drawbridge instance
   */
  getDrawbridge: () => Drawbridge

  /**
   * Whether the device is a phone (reactive store value)
   * Used to determine whether to show deep links vs no-wallets modal
   * @default false
   */
  isPhone?: boolean

  /**
   * Callback when wallet connection succeeds
   * Called after drawbridge.connectWallet() completes
   */
  onSuccess?: () => void | Promise<void>

  /**
   * Callback when an error occurs
   * @param error - The error that occurred
   * @param message - A human-readable message describing the error context
   */
  onError?: (error: unknown, message: string) => void
}

/**
 * Preferred wallet order for sorting connectors
 */
const PREFERRED_WALLET_ORDER = ["metamask", "phantom", "rabby", "coinbase"]

/**
 * Get the sort priority for a connector based on preferred order
 * Returns index in preferred list, or high number if not in list
 */
function getWalletPriority(connector: ConnectorInfo): number {
  const searchTerm = `${connector.id} ${connector.name}`.toLowerCase()

  for (let i = 0; i < PREFERRED_WALLET_ORDER.length; i++) {
    if (searchTerm.includes(PREFERRED_WALLET_ORDER[i])) {
      return i
    }
  }

  // Not in preferred list, send to bottom
  return 9999
}

/**
 * Try to detect the provider name from window.ethereum
 */
function detectProviderName(): string {
  if (typeof window === "undefined" || !window.ethereum) {
    return "Wallet"
  }

  const eth = window.ethereum as any
  if (eth.isCoinbaseWallet) return "BASE Wallet"
  if (eth.isMetaMask) return "MetaMask"
  if (eth.isRabby) return "Rabby"
  if (eth.isPhantom) return "Phantom"

  return "Wallet"
}

/**
 * Check if an error is a user rejection error
 */
function isUserRejectionError(error: unknown): boolean {
  if (!error) return false

  const errorObj = error as any
  const code = errorObj?.code
  const message = errorObj?.message?.toLowerCase() ?? ""
  const details = errorObj?.details?.toLowerCase() ?? ""

  // Common rejection codes
  if (code === 4001 || code === "ACTION_REJECTED") return true

  // Common rejection messages
  const rejectionPhrases = ["user rejected", "user denied", "rejected by user", "user cancelled"]
  return rejectionPhrases.some(phrase => message.includes(phrase) || details.includes(phrase))
}

/**
 * Creates a wallet connection state manager with all the logic needed
 * for handling wallet connections across different frontends.
 *
 * This hook extracts the shared wallet connection logic from the main client
 * and makes it reusable across all frontends while allowing each frontend
 * to customize the UI/layout.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createWalletConnection } from "@ratfun/shared-ui/WalletConnection"
 *   import { getDrawbridge } from "$lib/modules/drawbridge"
 *
 *   const wallet = createWalletConnection({
 *     getDrawbridge,
 *     isPhone: $isPhone,
 *     onSuccess: () => console.log("Connected!"),
 *     onError: (err, msg) => console.error(msg, err)
 *   })
 *
 *   onMount(() => wallet.prepareConnectors())
 * </script>
 *
 * <button onclick={wallet.handleClick} disabled={wallet.connecting}>
 *   {wallet.connecting ? "Connecting..." : "Connect Wallet"}
 * </button>
 *
 * <WalletSelectModal
 *   bind:show={wallet.showWalletSelect}
 *   connectors={wallet.availableConnectors}
 *   connecting={wallet.connecting}
 *   onSelect={wallet.connectWallet}
 * />
 * ```
 */
export function createWalletConnection(options: WalletConnectionOptions) {
  const { getDrawbridge, isPhone = false, onSuccess, onError } = options

  // Reactive state
  let connecting = $state(false)
  let showWalletSelect = $state(false)
  let showNoWalletsModal = $state(false)
  let showDeepLinkSelect = $state(false)
  let availableConnectors = $state<ConnectorInfo[]>([])

  /**
   * Prepare and sort available connectors from drawbridge.
   * Call this on component mount.
   */
  function prepareConnectors(): void {
    const drawbridge = getDrawbridge()
    const connectors = drawbridge.getAvailableConnectors()

    // Check if window.ethereum exists
    const hasInjectedProvider =
      typeof window !== "undefined" && typeof window.ethereum !== "undefined"

    console.log("[WalletConnection] Connector setup:", {
      connectors: connectors.length,
      hasInjectedProvider
    })

    // Filter out generic "Injected" connector - only show specific wallets
    const filteredConnectors = connectors.filter(c => c.id !== "injected" && c.name !== "Injected")

    // CRITICAL: If we filtered out all connectors BUT window.ethereum exists,
    // keep injected connector (Base app case)
    if (filteredConnectors.length === 0 && connectors.length > 0 && hasInjectedProvider) {
      console.log(
        "[WalletConnection] No specific wallets but window.ethereum exists - keeping injected"
      )

      // Improve the display name for injected connector
      const injectedConnector = connectors.find(c => c.id === "injected")
      if (injectedConnector) {
        availableConnectors = [
          {
            id: injectedConnector.id,
            name: detectProviderName(),
            type: injectedConnector.type
          }
        ]
      } else {
        availableConnectors = connectors
      }
    } else if (filteredConnectors.length === 0 && !hasInjectedProvider) {
      // No specific wallets AND no window.ethereum - show deep links or no wallets
      console.log("[WalletConnection] No wallets detected")
      availableConnectors = []
    } else {
      // We have specific wallets, use those
      availableConnectors = filteredConnectors.sort(
        (a, b) => getWalletPriority(a) - getWalletPriority(b)
      )
    }

    console.log("[WalletConnection] Final connectors:", availableConnectors)
  }

  /**
   * Connect to a specific wallet by connector ID.
   * This is passed to WalletSelectModal's onSelect prop.
   */
  async function connectWallet(connectorId: string): Promise<void> {
    console.log("[WalletConnection] Connecting to:", connectorId)

    try {
      connecting = true

      const drawbridge = getDrawbridge()
      await drawbridge.connectWallet(connectorId)

      console.log("[WalletConnection] Wallet connected successfully")

      // Close the modal
      showWalletSelect = false

      // Call success callback if provided
      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      console.error("[WalletConnection] Connection failed:", error)

      if (onError) {
        const message = isUserRejectionError(error)
          ? "Wallet connection rejected by user"
          : "Failed to connect wallet"
        onError(error, message)
      }
    } finally {
      connecting = false
    }
  }

  /**
   * Handle the main connect button click.
   * Decides which modal to show based on available connectors and device type.
   */
  function handleClick(): void {
    // If no connectors available, show the appropriate modal
    if (availableConnectors.length === 0) {
      console.log("[WalletConnection] No connectors available")
      if (isPhone) {
        showDeepLinkSelect = true
      } else {
        showNoWalletsModal = true
      }
      return
    }

    // If only one connector available, auto-connect to it (but not on mobile
    // where wallet interactions are more fragile and can fail with -32002 errors)
    if (availableConnectors.length === 1 && !isPhone) {
      console.log("[WalletConnection] Only one connector available, auto-connecting")
      connectWallet(availableConnectors[0].id)
      return
    }

    // Otherwise show the modal for user to choose
    showWalletSelect = true
  }

  // Return reactive state and methods
  // Using getters to expose reactive state properly
  return {
    // State (reactive via getters)
    get connecting() {
      return connecting
    },
    get showWalletSelect() {
      return showWalletSelect
    },
    set showWalletSelect(value: boolean) {
      showWalletSelect = value
    },
    get showNoWalletsModal() {
      return showNoWalletsModal
    },
    set showNoWalletsModal(value: boolean) {
      showNoWalletsModal = value
    },
    get showDeepLinkSelect() {
      return showDeepLinkSelect
    },
    set showDeepLinkSelect(value: boolean) {
      showDeepLinkSelect = value
    },
    get availableConnectors() {
      return availableConnectors
    },

    // Methods
    prepareConnectors,
    connectWallet,
    handleClick
  }
}
