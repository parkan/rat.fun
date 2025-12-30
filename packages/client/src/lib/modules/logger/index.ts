/**
 * Client logger utility
 *
 * A conditional logger that prevents memory leaks from console.log in production.
 * Logging can be toggled on/off via environment variables or runtime configuration.
 *
 * Benefits:
 * - Prevents memory retention when browser DevTools are open in production
 * - Provides namespace/prefix support for easier filtering
 * - Can be completely stripped in production builds
 */

// Logging is enabled by default in development, disabled in production
let loggingEnabled = import.meta.env.DEV ?? false

/**
 * Set whether logging is enabled
 * Call this during app initialization to override default behavior
 */
export function setLoggingEnabled(enabled: boolean): void {
  loggingEnabled = enabled
}

/**
 * Check if logging is enabled
 */
export function isLoggingEnabled(): boolean {
  return loggingEnabled
}

/**
 * Create a namespaced logger with a specific prefix
 *
 * @param namespace - The prefix to add to all log messages (e.g., "[CMS]", "[Chain Sync]")
 * @returns A logger instance with the namespace prefix
 *
 * @example
 * const logger = createLogger("[MyModule]")
 * logger.log("Starting initialization") // Output: "[MyModule] Starting initialization"
 */
export function createLogger(namespace: string) {
  return {
    log: (...args: unknown[]): void => {
      if (loggingEnabled) {
        console.log(namespace, ...args)
      }
    },
    warn: (...args: unknown[]): void => {
      if (loggingEnabled) {
        console.warn(namespace, ...args)
      }
    },
    error: (...args: unknown[]): void => {
      // Errors are always logged regardless of logging setting
      console.error(namespace, ...args)
    },
    debug: (...args: unknown[]): void => {
      if (loggingEnabled) {
        console.debug(namespace, ...args)
      }
    },
    info: (...args: unknown[]): void => {
      if (loggingEnabled) {
        console.info(namespace, ...args)
      }
    }
  }
}

/**
 * Default logger without namespace
 * Use this for general logging or create a namespaced logger with createLogger()
 */
export const logger = createLogger("[Client]")
