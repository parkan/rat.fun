/**
 * Convert an address to padded bytes32 ID format used by MUD
 */
export function addressToId(address: string): string {
  if (!address) return "0x0"
  // remove '0x' prefix, pad the address with leading zeros up to 64 characters, then add '0x' prefix back
  return "0x" + address.slice(2).padStart(64, "0").toLowerCase()
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function until it returns a truthy result or times out
 */
export async function retryUntilResult<T>(
  fn: () => T | undefined | null,
  timeoutMs: number = 5000,
  retryIntervalMs: number = 100,
  condition?: (result: T | undefined | null) => boolean
): Promise<T | null> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    const result = fn()

    const isValid = condition ? condition(result) : Boolean(result)

    if (isValid) {
      return result as T
    }

    await sleep(retryIntervalMs)
  }

  return null
}
