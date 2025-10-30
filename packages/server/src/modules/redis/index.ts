import { createClient, RedisClientType } from "redis"
import {
  RedisError,
  RedisConnectionError,
  RedisOperationError
} from "@modules/error-handling/errors"

// In-memory storage for local development
class InMemoryStore {
  private nonces: Map<number, number> = new Map() // Map<nonce, expirationTimestamp>
  private readonly NONCE_TTL_MS = 60000 // 60 seconds

  async storeNonce(nonce: number): Promise<void> {
    const expirationTime = Date.now() + this.NONCE_TTL_MS
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

// Redis client wrapper
class RedisStore {
  private client: RedisClientType
  private isConnected = false

  constructor(redisUrl?: string) {
    this.client = createClient({
      url: redisUrl
    })

    this.client.on("error", err => {
      console.error("Redis Client Error:", err)
      this.isConnected = false
    })

    this.client.on("connect", () => {
      console.log("Redis Client Connected")
      this.isConnected = true
    })
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect()
      }
    } catch (error) {
      throw new RedisConnectionError(
        `Failed to connect to Redis: ${error instanceof Error ? error.message : String(error)}`,
        error
      )
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.quit()
      }
    } catch (error) {
      throw new RedisConnectionError(
        `Failed to disconnect from Redis: ${error instanceof Error ? error.message : String(error)}`,
        error
      )
    }
  }

  async storeNonce(nonce: number): Promise<void> {
    try {
      await this.connect()
      await this.client.set(`nonce:${nonce}`, "true", { EX: 60 }) // Expire after 60 seconds
    } catch (error) {
      // If it's already one of our custom errors, rethrow it
      if (error instanceof RedisError) {
        throw error
      }

      // Otherwise, wrap it in our custom error
      throw new RedisOperationError(
        `Failed to store nonce in Redis: ${error instanceof Error ? error.message : String(error)}`,
        "storeNonce",
        error
      )
    }
  }

  async hasNonce(nonce: number): Promise<boolean> {
    try {
      await this.connect()
      const exists = await this.client.exists(`nonce:${nonce}`)
      return exists === 1
    } catch (error) {
      // If it's already one of our custom errors, rethrow it
      if (error instanceof RedisError) {
        throw error
      }

      // Otherwise, wrap it in our custom error
      throw new RedisOperationError(
        `Failed to check nonce in Redis: ${error instanceof Error ? error.message : String(error)}`,
        "hasNonce",
        error
      )
    }
  }
}

// Singleton instance
let storeInstance: InMemoryStore | RedisStore | null = null

// Factory function to create the appropriate store (singleton pattern)
export function createStore(): InMemoryStore | RedisStore {
  // Return existing instance if already created
  if (storeInstance) {
    return storeInstance
  }

  const redisUrl = process.env.REDIS_URL

  if (redisUrl) {
    console.log("Using Redis store")
    storeInstance = new RedisStore(redisUrl)
  } else {
    console.log("Using in-memory store for development")
    storeInstance = new InMemoryStore()
  }

  return storeInstance
}

// Export types for convenience
export type Store = InMemoryStore | RedisStore
