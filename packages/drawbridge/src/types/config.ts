/**
 * Deployment timeout and delay constants
 *
 * These values control timing for wallet and session deployment operations.
 * Adjust based on chain speed and network conditions.
 */
export const DEPLOYMENT_TIMEOUTS = {
  /**
   * Timeout for session account deployment (milliseconds)
   *
   * After this time, we give up waiting for the session account to deploy.
   * Default: 30 seconds
   *
   * Increase for slower chains or congested networks.
   */
  SESSION_DEPLOYMENT: 30_000,

  /**
   * Delay after wallet deployment to allow bundler state synchronization (milliseconds)
   *
   * After deploying a counterfactual wallet, bundlers cache the account state
   * and need time to refresh their internal state before accepting operations.
   *
   * Default: 2 seconds
   *
   * This prevents "AA10" errors on the next user operation.
   * See: https://github.com/eth-infinitism/account-abstraction/discussions
   */
  BUNDLER_STATE_SYNC: 2_000
} as const
