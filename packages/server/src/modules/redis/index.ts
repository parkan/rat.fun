import { createClient, RedisClientType } from "redis"
import type { OffChainMessage } from "@modules/types"
import {
  RedisError,
  RedisConnectionError,
  RedisOperationError,
  RedisDataError
} from "@modules/error-handling/errors"

// In-memory storage for local development
class InMemoryStore {
  private messages: OffChainMessage[] = []
  private nonces: Record<number, boolean> = {}

  async storeMessage(message: OffChainMessage): Promise<OffChainMessage> {
    this.messages.push(message)
    return message
  }

  async getMessages(limit?: number): Promise<OffChainMessage[]> {
    const messages = [...this.messages]
    // Sort by timestamp: oldest first, newest last
    messages.sort((a, b) => a.timestamp - b.timestamp)
    return limit ? messages.slice(-limit) : messages
  }

  async storeNonce(nonce: number): Promise<void> {
    this.nonces[nonce] = true
  }

  async hasNonce(nonce: number): Promise<boolean> {
    return this.nonces[nonce] ?? false
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

  async storeMessage(message: OffChainMessage): Promise<OffChainMessage> {
    try {
      await this.connect()
      const key = `message:${message.id}`
      await this.client.set(key, JSON.stringify(message))
      await this.client.lPush("messages:list", key)
      // Keep only last 1000 messages
      await this.client.lTrim("messages:list", 0, 999)
      return message
    } catch (error) {
      // If it's already one of our custom errors, rethrow it
      if (error instanceof RedisError) {
        throw error
      }

      // Otherwise, wrap it in our custom error
      throw new RedisOperationError(
        `Failed to store message in Redis: ${error instanceof Error ? error.message : String(error)}`,
        "storeMessage",
        error
      )
    }
  }

  async getMessages(limit?: number): Promise<OffChainMessage[]> {
    try {
      await this.connect()
      const messageKeys = await this.client.lRange("messages:list", 0, -1)
      const messages: OffChainMessage[] = []

      for (const key of messageKeys) {
        const messageData = await this.client.get(key)
        if (messageData) {
          try {
            messages.push(JSON.parse(messageData))
          } catch (parseError) {
            throw new RedisDataError(
              `Failed to parse message data from Redis: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
              messageData
            )
          }
        }
      }

      // Sort by timestamp: oldest first, newest last
      messages.sort((a, b) => a.timestamp - b.timestamp)
      return limit ? messages.slice(-limit) : messages
    } catch (error) {
      // If it's already one of our custom errors, rethrow it
      if (error instanceof RedisError) {
        throw error
      }

      // Otherwise, wrap it in our custom error
      throw new RedisOperationError(
        `Failed to get messages from Redis: ${error instanceof Error ? error.message : String(error)}`,
        "getMessages",
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
