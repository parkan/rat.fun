import { OffChainMessage } from "@modules/types"
import { storeMessage } from "@modules/message-store"

// Store active WebSocket connections
export const wsConnections: { [playerId: string]: WebSocket } = {}

export function sendToClient(playerId: string, messageObject: OffChainMessage): void {
  const playerWebSocket = wsConnections[playerId]
  if (playerWebSocket) {
    try {
      playerWebSocket.send(JSON.stringify(messageObject))
    } catch (error) {
      console.error(`Failed to send message to Player ID ${playerId}:`, error)
      // Remove the broken connection
      delete wsConnections[playerId]
    }
  } else {
    console.error(`No active WebSocket connection for Player ID: ${playerId}`)
  }
}

export async function broadcast(messageObject: OffChainMessage): Promise<void> {
  // Store the message in the message store
  if (!["clients__update", "test"].includes(messageObject.topic)) {
    try {
      await storeMessage(messageObject)
    } catch (error) {
      // Log the error but don't fail the broadcast
      console.error("Failed to store message:", error)
    }
  }

  // Broadcast to all connected clients
  Object.keys(wsConnections).forEach(playerId => {
    sendToClient(playerId, messageObject)
  })
}
