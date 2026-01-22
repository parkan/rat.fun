import { createStore } from "@modules/redis"

// Create the store instance
const store = createStore()

/**
 * Atomically check if nonce exists and store it if not.
 * Returns true if nonce was newly stored (didn't exist), false if it already existed.
 * This prevents race conditions in nonce validation.
 */
export async function storeNonceIfNew(nonce: number): Promise<boolean> {
  return await store.storeNonceIfNew(nonce)
}

// Store a new nonce
export async function storeNonce(nonce: number) {
  await store.storeNonce(nonce)
}

// Check if nonce exists
export async function hasNonce(nonce: number): Promise<boolean> {
  return await store.hasNonce(nonce)
}
