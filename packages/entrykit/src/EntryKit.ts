import { Address, Client } from "viem"
import type { PaymasterClient } from "viem/account-abstraction"
import { SessionClient } from "./core/types"
import { getSessionSigner } from "./session/getSessionSigner"
import { getSessionAccount } from "./session/getSessionAccount"
import { getSessionClient } from "./session/getSessionClient"
import { checkDelegation } from "./delegation/checkDelegation"
import { setupSession } from "./delegation/setupSession"
import { sessionStorage } from "./session/storage"

/**
 * Configuration for EntryKit instance
 */
export type EntryKitConfig = {
  /** Chain ID to operate on */
  chainId: number
  /** MUD World contract address */
  worldAddress: Address
  /** Optional paymaster client for sponsored transactions */
  paymasterClient?: PaymasterClient
}

/**
 * Current state of the EntryKit instance
 * Updated reactively and broadcast to subscribers
 */
export type EntryKitState = {
  /** Session client with MUD World extensions, null if not connected */
  sessionClient: SessionClient | null
  /** Original user's wallet address, null if not connected */
  userAddress: Address | null
  /** Session smart account address, null if not connected */
  sessionAddress: Address | null
  /** Whether session has delegation registered and is ready to use */
  isReady: boolean
}

/**
 * Result of checking session prerequisites
 */
export type PrerequisiteStatus = {
  /** Whether delegation is registered in World contract */
  hasDelegation: boolean
  /** Whether session is fully ready (same as hasDelegation) */
  isReady: boolean
}

type StateListener = (state: EntryKitState) => void
type Unsubscribe = () => void

/**
 * EntryKit - Framework-agnostic session account management for MUD applications
 *
 * Provides:
 * - ERC-4337 session account creation
 * - MUD World delegation registration
 * - Reactive state management (framework-agnostic)
 * - Gasless transaction support via paymaster
 *
 * Usage:
 * ```typescript
 * const entrykit = new EntryKit({
 *   chainId: 8453,
 *   worldAddress: "0x...",
 *   paymasterClient: myPaymaster
 * });
 *
 * // Subscribe to state changes
 * entrykit.subscribe((state) => {
 *   console.log("Session:", state.sessionClient);
 * });
 *
 * // Connect wallet
 * await entrykit.connect(walletClient);
 *
 * // Setup delegation if needed
 * if (!entrykit.isReady) {
 *   await entrykit.setupSession(walletClient);
 * }
 * ```
 */
export class EntryKit {
  private config: EntryKitConfig
  private state: EntryKitState
  private listeners = new Set<StateListener>()

  constructor(config: EntryKitConfig) {
    this.config = config
    this.state = {
      sessionClient: null,
      userAddress: null,
      sessionAddress: null,
      isReady: false
    }
  }

  // ===== Reactive State Management =====

  /**
   * Subscribe to state changes
   *
   * The listener will be called immediately with the current state,
   * and again whenever the state changes.
   *
   * @param listener Function to call on state changes
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = entrykit.subscribe((state) => {
   *   if (state.sessionClient) {
   *     console.log("Session ready:", state.sessionClient.account.address);
   *   }
   * });
   *
   * // Later, stop listening
   * unsubscribe();
   * ```
   */
  subscribe(listener: StateListener): Unsubscribe {
    this.listeners.add(listener)
    listener(this.state) // Immediate callback with current state
    return () => this.listeners.delete(listener)
  }

  /**
   * Get current state (non-reactive snapshot)
   *
   * For reactive updates, use subscribe() instead.
   */
  getState(): EntryKitState {
    return { ...this.state }
  }

  private updateState(updates: Partial<EntryKitState>): void {
    this.state = { ...this.state, ...updates }
    this.notify()
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state))
  }

  // ===== Core API =====

  /**
   * Connect with user's wallet and create session account
   *
   * This will:
   * 1. Generate or retrieve session keypair from localStorage
   * 2. Create a SimpleAccount smart account with session keypair as owner
   * 3. Create a SessionClient with MUD World extensions
   * 4. Check if delegation already exists
   *
   * After this, check `isReady` to see if delegation needs to be set up.
   *
   * @param userClient User's wallet client (from wagmi/viem)
   * @throws If wallet client is missing account or chain
   */
  async connect(userClient: Client): Promise<void> {
    if (!userClient.account) {
      throw new Error("Wallet client must have an account.")
    }
    if (!userClient.chain) {
      throw new Error("Wallet client must have a chain.")
    }

    const userAddress = userClient.account.address

    // Get or create persistent session signer from localStorage
    const signer = getSessionSigner(userAddress)

    // Create ERC-4337 SimpleAccount smart wallet
    const { account } = await getSessionAccount({
      client: userClient as any,
      userAddress
    })

    // Create session client with MUD World callFrom/sendUserOperationFrom extensions
    const sessionClient = await getSessionClient({
      userAddress,
      sessionAccount: account,
      sessionSigner: signer,
      worldAddress: this.config.worldAddress,
      paymasterOverride: this.config.paymasterClient
    })

    this.updateState({
      sessionClient,
      userAddress,
      sessionAddress: account.address
    })

    // Check if delegation already exists in World contract
    await this.checkPrerequisites()
  }

  /**
   * Check if session is ready to use
   *
   * Queries the MUD World contract to check if delegation is registered
   * between the user's account and the session account.
   *
   * @returns Delegation status
   */
  async checkPrerequisites(): Promise<PrerequisiteStatus> {
    if (!this.state.sessionClient) {
      return { hasDelegation: false, isReady: false }
    }

    const hasDelegation = await checkDelegation({
      client: this.state.sessionClient,
      worldAddress: this.config.worldAddress,
      userAddress: this.state.userAddress!,
      sessionAddress: this.state.sessionAddress!
    })

    this.updateState({ isReady: hasDelegation })

    return { hasDelegation, isReady: hasDelegation }
  }

  /**
   * Setup session by registering delegation and deploying account
   *
   * This will:
   * 1. Register delegation in MUD World contract (user delegates to session)
   * 2. Deploy session smart account if not already deployed
   *
   * User will need to sign a transaction (EOA) or user operation (smart account).
   *
   * @param userClient User's wallet client for signing the delegation
   * @throws If not connected (call connect() first)
   */
  async setupSession(userClient: Client): Promise<void> {
    if (!this.state.sessionClient) {
      throw new Error("Not connected. Call connect() first.")
    }

    await setupSession({
      client: userClient,
      userClient,
      sessionClient: this.state.sessionClient,
      worldAddress: this.config.worldAddress
    })

    this.updateState({ isReady: true })
  }

  /**
   * Disconnect and clear session state
   *
   * Note: This does NOT clear stored session keys.
   * Use clearStorage() to permanently remove session keys.
   */
  disconnect(): void {
    this.updateState({
      sessionClient: null,
      userAddress: null,
      sessionAddress: null,
      isReady: false
    })
  }

  /**
   * Clear stored session keys from localStorage
   *
   * This permanently removes the session private key for the current user.
   * Next time connect() is called, a new session account will be created.
   */
  clearStorage(): void {
    if (this.state.userAddress) {
      sessionStorage.removeSigner(this.state.userAddress)
    }
  }

  // ===== Convenience Getters =====

  /** Get current session client (null if not connected) */
  get sessionClient(): SessionClient | null {
    return this.state.sessionClient
  }

  /** Get current user address (null if not connected) */
  get userAddress(): Address | null {
    return this.state.userAddress
  }

  /** Get current session account address (null if not connected) */
  get sessionAddress(): Address | null {
    return this.state.sessionAddress
  }

  /** Check if session is ready (has delegation) */
  get isReady(): boolean {
    return this.state.isReady
  }
}
