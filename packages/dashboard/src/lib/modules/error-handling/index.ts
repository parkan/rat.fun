import { AppError, parseViemError, type ExpectedError } from "@ratfun/common/error-handling"
import { toastManager } from "$lib/modules/ui/toasts.svelte"

export * from "@ratfun/common/error-handling"

type SeverityLevel = "error" | "info" | "warning" | "success" | undefined

export function errorHandler(error: ExpectedError | unknown, message = "") {
  let processedError: ExpectedError | unknown = error

  // Auto-detect and parse viem errors
  if (error && typeof error === "object" && "name" in error) {
    // Check if it's a viem BaseError by checking for viem-specific properties
    if ("shortMessage" in error || "code" in error || error.constructor.name.includes("Error")) {
      try {
        // Try to parse as viem error
        processedError = parseViemError(error as any)
      } catch (parseError) {
        // If parsing fails, keep original error
        console.warn("Failed to parse potential viem error:", parseError)
      }
    }
  }

  const errorCode = processedError instanceof AppError ? processedError.code : "UNKNOWN_ERROR"
  const errorMessage = `${errorCode}: ${message ? message + (processedError as any)?.message : (processedError as any)?.message || ""}`

  // Determine severity level based on error type
  let severity = "error"
  if (processedError instanceof AppError) {
    // User-rejected transactions are info level (not really errors)
    if (processedError.code === "USER_REJECTED") {
      severity = "info"
    }
    // Expected validation and user input errors are warnings
    else if (
      processedError.code.includes("VALIDATION") ||
      processedError.code.includes("CHARACTER_LIMIT")
    ) {
      severity = "warning"
    }
    // Network and temporary issues are info level
    else if (processedError.code.includes("NETWORK") || processedError.code.includes("TIMEOUT")) {
      severity = "info"
    }
    // Critical system errors remain as errors
    else if (
      processedError.code.includes("WEBGL_CONTEXT") ||
      processedError.code.includes("WORLD_ADDRESS")
    ) {
      severity = "error"
    }
  }

  toastManager.add({ message: errorMessage, type: severity as SeverityLevel })

  // Log the error to the console
  console.error(processedError)
}
