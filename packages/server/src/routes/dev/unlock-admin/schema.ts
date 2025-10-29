export const schema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string", description: "The player ID to grant admin privileges to" }
    },
    required: ["id"]
  },
  response: {
    200: {
      type: "object",
      description: "Successful response",
      properties: {
        success: { type: "boolean", description: "Whether the operation was successful" },
        message: { type: "string", description: "Success message" }
      },
      required: ["success", "message"]
    },
    400: {
      type: "object",
      description: "Bad request response",
      properties: {
        success: { type: "boolean", description: "Whether the operation was successful" },
        error: { type: "string", description: "Error message explaining the issue" }
      },
      required: ["success", "error"]
    },
    403: {
      type: "object",
      description: "Forbidden response - only available in local development",
      properties: {
        success: { type: "boolean", description: "Whether the operation was successful" },
        error: { type: "string", description: "Error message explaining the issue" }
      },
      required: ["success", "error"]
    },
    500: {
      type: "object",
      description: "Error response for internal server issues",
      properties: {
        success: { type: "boolean", description: "Whether the operation was successful" },
        error: { type: "string", description: "Error message explaining the issue" }
      },
      required: ["success", "error"]
    }
  }
}
