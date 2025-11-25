export const schema = {
  params: {
    type: "object",
    properties: {
      playerId: { type: "string", minLength: 1 }
    },
    required: ["playerId"]
  },
  querystring: {
    type: "object",
    properties: {
      data: { type: "string", minLength: 1 },
      info: { type: "string", minLength: 1 },
      signature: { type: "string", minLength: 1 }
    },
    required: ["data", "info", "signature"]
  }
}
