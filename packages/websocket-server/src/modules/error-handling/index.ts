import type { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import {
  AppError,
  WebSocketError,
  SignatureError,
  StaleRequestError,
  NonceUsedError,
  DelegationNotFoundError,
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
  // Handle specific timeout and connection errors
  if (error.message.includes("premature close") || error.message.includes("Premature close")) {
    // Log as info since this is often due to client disconnection
    request.log.info({
      error: error.message,
      url: request.url,
      method: request.method,
      code: "CLIENT_DISCONNECTED",
      msg: `CLIENT_DISCONNECTED: ${error.message}`
    })
    return // Don't send response as connection is already closed
  }

  // Log the error with a proper message for the one-line logger
  const errorCode = error instanceof AppError ? error.code : "UNKNOWN_ERROR"
  const errorMessage = `${errorCode}: ${error.message}`

  request.log.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    code: errorCode,
    msg: errorMessage
  })

  // Handle client errors (400)
  if (
    error instanceof SignatureError ||
    error instanceof StaleRequestError ||
    error instanceof NonceUsedError ||
    error instanceof DelegationNotFoundError
  ) {
    return createClientErrorResponse(reply, request, error)
  }

  // Handle server errors (500)
  if (
    error instanceof WebSocketError ||
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
