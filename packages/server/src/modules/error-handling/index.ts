import type { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import {
  AppError,
  ValidationError,
  AuthorizationError,
  InsufficientBalanceError,
  InvalidLevelError,
  InvalidPromptError,
  RatOwnershipError,
  RatDeadError,
  LevelMismatchError,
  RoomBalanceError,
  StaleRequestError,
  NonceUsedError,
  DelegationNotFoundError,
  ChainNotFoundError,
  WorldAddressNotFoundError,
  ReplicateError,
  OnchainDataError,
  RatNotFoundError,
  RoomNotFoundError,
  PlayerNotFoundError,
  GameConfigNotFoundError,
  LevelNotFoundError,
  SystemCallError,
  ContractCallError,
  OutcomeUpdateError,
  LLMError,
  LLMAPIError,
  LLMParseError,
  CMSError,
  CMSAPIError,
  CMSDataError,
  RedisError,
  RedisConnectionError,
  RedisOperationError,
  RedisDataError
} from "./errors"

/**
 * Helper function to create client error responses (400)
 */
function createClientErrorResponse(reply: FastifyReply, request: FastifyRequest, error: AppError) {
  return reply.status(400).send({
    error: error.errorType,
    code: error.code,
    message: error.message,
    timestamp: Date.now(),
    path: request.url
  })
}

/**
 * Helper function to create server error responses (500)
 */
function createServerErrorResponse(reply: FastifyReply, request: FastifyRequest, error: AppError) {
  return reply.status(500).send({
    error: error.errorType,
    code: error.code,
    message: error.message,
    timestamp: Date.now(),
    path: request.url
  })
}

/**
 * Centralized error handler for Fastify
 */
export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // Log the error with a proper message for the one-line logger
  const errorCode = error instanceof AppError ? error.code : "UNKNOWN_ERROR"
  const errorMessage = `${errorCode}: ${error.message}`

  request.log.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    code: errorCode,
    msg: errorMessage // This will be the main message shown by one-line-logger
  })

  // Handle client errors (400)
  if (
    error instanceof ValidationError ||
    error instanceof AuthorizationError ||
    error instanceof InsufficientBalanceError ||
    error instanceof RatNotFoundError ||
    error instanceof RoomNotFoundError ||
    error instanceof PlayerNotFoundError ||
    error instanceof GameConfigNotFoundError ||
    error instanceof LevelNotFoundError ||
    error instanceof RatOwnershipError ||
    error instanceof RatDeadError ||
    error instanceof LevelMismatchError ||
    error instanceof RoomBalanceError ||
    error instanceof InvalidLevelError ||
    error instanceof InvalidPromptError ||
    error instanceof StaleRequestError ||
    error instanceof NonceUsedError ||
    error instanceof DelegationNotFoundError
  ) {
    return createClientErrorResponse(reply, request, error)
  }

  // Handle server errors (500)
  if (
    error instanceof ChainNotFoundError ||
    error instanceof WorldAddressNotFoundError ||
    error instanceof ReplicateError ||
    error instanceof OnchainDataError ||
    error instanceof ContractCallError ||
    error instanceof OutcomeUpdateError ||
    error instanceof SystemCallError ||
    error instanceof LLMAPIError ||
    error instanceof LLMParseError ||
    error instanceof LLMError ||
    error instanceof CMSAPIError ||
    error instanceof CMSDataError ||
    error instanceof CMSError ||
    error instanceof RedisError ||
    error instanceof RedisConnectionError ||
    error instanceof RedisOperationError ||
    error instanceof RedisDataError
  ) {
    return createServerErrorResponse(reply, request, error)
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.validation,
      message: error.message,
      timestamp: Date.now(),
      path: request.url
    })
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === "development"

  return reply.status(500).send({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    message: isDevelopment ? error.message : "An unexpected error occurred",
    ...(isDevelopment && { stack: error.stack }),
    timestamp: Date.now(),
    path: request.url
  })
}

/**
 * Handle WebSocket errors and send appropriate messages
 */
export function handleWebSocketError(error: unknown, socket: WebSocket): void {
  console.error("WebSocket Error:", error)

  const baseResponse = {
    error: error instanceof Error ? error.message : String(error),
    code: error instanceof AppError ? error.code : "UNKNOWN_ERROR",
    timestamp: Date.now()
  }

  const errorMessage = {
    topic: "error",
    ...baseResponse
  }

  socket.send(JSON.stringify(errorMessage))
}

/**
 * Handle errors in background processes (outside of main request context)
 */
export function handleBackgroundError(error: unknown, context: string): void {
  const errorCode = error instanceof AppError ? error.code : "UNKNOWN_ERROR"
  const errorMessage = `${errorCode}: ${error instanceof Error ? error.message : String(error)}`

  console.error(`🚨 BACKGROUND ERROR [${context}]:`, {
    message: errorMessage,
    code: errorCode,
    stack: error instanceof Error ? error.stack : undefined,
    context
  })
}
