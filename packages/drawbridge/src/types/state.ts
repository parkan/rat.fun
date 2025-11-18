/**
 * Drawbridge connection and setup status
 *
 * Provides a single source of truth for the current state of Drawbridge.
 * Transitions follow this flow:
 *
 * UNINITIALIZED → initialize() → DISCONNECTED
 *                                      ↓
 *                      connectWallet() ↓
 *                                      ↓
 *                                 CONNECTED
 *                                      ↓
 *                      setupSession()  ↓
 *                                      ↓
 *                             SETTING_UP_SESSION
 *                                      ↓
 *                                   READY
 *
 * Note: READY state can be reached directly from DISCONNECTED if reconnection succeeds.
 */
export enum DrawbridgeStatus {
  /** Drawbridge not yet initialized - call initialize() */
  UNINITIALIZED = "uninitialized",

  /** Drawbridge initialized but no wallet connected */
  DISCONNECTED = "disconnected",

  /** Wallet connection in progress */
  CONNECTING = "connecting",

  /** Wallet connected, but session setup needed (delegation not registered) */
  CONNECTED = "connected",

  /** Session setup in progress (registering delegation) */
  SETTING_UP_SESSION = "setting_up_session",

  /** Fully ready - session client available and delegation registered */
  READY = "ready",

  /** An error occurred */
  ERROR = "error"
}
