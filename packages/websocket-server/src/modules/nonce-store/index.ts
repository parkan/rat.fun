/**
 * In-memory nonce store for replay attack prevention.
 * Nonces expire after TTL to prevent unbounded memory growth.
 */

const NONCE_TTL_MS = 60000 // 60 seconds

class NonceStore {
  private nonces: Map<number, number> = new Map() // Map<nonce, expirationTimestamp>

  async storeNonce(nonce: number): Promise<void> {
    const expirationTime = Date.now() + NONCE_TTL_MS
    this.nonces.set(nonce, expirationTime)
    // Clean up expired nonces to prevent unbounded growth
    this.cleanupExpiredNonces()
  }

  async hasNonce(nonce: number): Promise<boolean> {
    const expirationTime = this.nonces.get(nonce)
    if (!expirationTime) {
      return false
    }
    // Check if nonce has expired
    if (Date.now() > expirationTime) {
      this.nonces.delete(nonce)
      return false
    }
    return true
  }

  private cleanupExpiredNonces(): void {
    const now = Date.now()
    for (const [nonce, expirationTime] of this.nonces.entries()) {
      if (now > expirationTime) {
        this.nonces.delete(nonce)
      }
    }
  }
}

// Singleton instance
const nonceStore = new NonceStore()

export async function storeNonce(nonce: number): Promise<void> {
  return nonceStore.storeNonce(nonce)
}

export async function hasNonce(nonce: number): Promise<boolean> {
  return nonceStore.hasNonce(nonce)
}
