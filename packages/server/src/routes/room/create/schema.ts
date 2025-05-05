export const schema =     {
    body: {
      type: 'object',
      required: ['signature', 'roomPrompt'],
      properties: {
        signature: { type: 'string', description: 'The cryptographic signature for validation' },
        roomPrompt: { type: 'string', description: 'The prompt for the room' }
      }
    },
    response: {
      200: {
        type: 'object',
        description: 'Successful response',
        properties: {
          success: { type: 'boolean', description: 'Whether the room was created successfully' }
        },
        required: ['success']
      },
      403: {
        type: 'object',
        description: 'Error response for forbidden access',
        properties: {
          error: { type: 'string', description: 'Error message explaining the issue' }
        },
        required: ['error']
      },
      500: {
        type: 'object',
        description: 'Error response for internal server issues',
        properties: {
          error: { type: 'string', description: 'Error message explaining the issue' }
        },
        required: ['error']
      }
    }
  }