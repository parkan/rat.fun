// Base error class for all application errors
export class AppError extends Error {
  constructor(
    public code: string = "APP_ERROR",
    public errorType: string = "Unknown error",
    message: string
  ) {
    super(message)
  }
}

// ============================================================================
// WebSocket Errors
// ============================================================================

export class WebSocketError extends AppError {
  constructor(
    code: string = "WEBSOCKET_ERROR",
    errorType: string = "WebSocket error",
    message: string
  ) {
    super(code, errorType, message)
  }
}

// ============================================================================
// Signature Errors
// ============================================================================

export class SignatureError extends AppError {
  constructor(
    code: string = "SIGNATURE_ERROR",
    errorType: string = "Invalid request",
    message: string
  ) {
    super(code, errorType, message)
  }
}

export class StaleRequestError extends SignatureError {
  constructor(message: string = "Stale request timestamp") {
    super("STALE_REQUEST_ERROR", "Stale request", message)
  }
}

export class NonceUsedError extends SignatureError {
  constructor(message: string = "Nonce already used") {
    super("NONCE_USED_ERROR", "Nonce already used", message)
  }
}

export class DelegationNotFoundError extends SignatureError {
  constructor(message: string = "Delegation not found") {
    super("DELEGATION_NOT_FOUND_ERROR", "Delegation not found", message)
  }
}

// ============================================================================
// Redis Errors
// ============================================================================

export class RedisError extends AppError {
  constructor(
    code: string = "REDIS_ERROR",
    errorType: string = "Redis service error",
    message: string
  ) {
    super(code, errorType, message)
  }
}

export class RedisConnectionError extends RedisError {
  constructor(
    message: string = "Failed to connect to Redis",
    public originalError?: unknown
  ) {
    super("REDIS_CONNECTION_ERROR", "Redis connection failed", message)
  }
}

export class RedisOperationError extends RedisError {
  constructor(
    message: string,
    public operation: string,
    public originalError?: unknown
  ) {
    super("REDIS_OPERATION_ERROR", "Redis operation failed", message)
  }
}

export class RedisDataError extends RedisError {
  constructor(
    message: string,
    public data?: unknown
  ) {
    super("REDIS_DATA_ERROR", "Redis data error", message)
  }
}

// ============================================================================
// Network Errors
// ============================================================================

export class NetworkError extends AppError {
  constructor(
    code: string = "NETWORK_ERROR",
    errorType: string = "Service unavailable",
    message: string
  ) {
    super(code, errorType, message)
  }
}

export class ChainNotFoundError extends NetworkError {
  constructor(chainId: string) {
    super("CHAIN_NOT_FOUND", "Service unavailable", `Chain ${chainId} not found`)
  }
}

export class WorldAddressNotFoundError extends NetworkError {
  constructor(chainId: string) {
    super(
      "WORLD_ADDRESS_NOT_FOUND",
      "Service unavailable",
      `No world address found for chain ${chainId}. Did you run \`mud deploy\`?`
    )
  }
}
