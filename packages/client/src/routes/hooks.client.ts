import type { HandleClientError } from "@sveltejs/kit"
import { errorHandler } from "$lib/modules/error-handling"
import { createLogger } from "$lib/modules/logger"

const logger = createLogger("[Hooks]")

export const handleError: HandleClientError = async ({ message }) => {
  if (import.meta.env.DEV) {
    logger.error(message)
  }

  errorHandler(undefined, message)

  return {
    message: "Whoops!"
  }
}
