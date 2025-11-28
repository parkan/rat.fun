import type { ClientsUpdateMessage } from "@modules/types"

// Store active WebSocket connections by playerId
export const wsConnections: Map<string, WebSocket> = new Map()

/**
 * Send a message to a specific client
 */
export function sendToClient(playerId: string, message: ClientsUpdateMessage): void {
  const playerWebSocket = wsConnections.get(playerId)
  if (playerWebSocket) {
    try {
      // Check if the WebSocket is still open before sending
      // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
      if (playerWebSocket.readyState === 1) {
        playerWebSocket.send(JSON.stringify(message))
      } else {
        // Remove the closed connection
        wsConnections.delete(playerId)
      }
    } catch (error) {
      console.error(`Failed to send message to Player ID ${playerId}:`, error)
      // Remove the broken connection
      wsConnections.delete(playerId)
    }
  }
}

/**
 * Broadcast a message to all connected clients
 */
export function broadcast(message: ClientsUpdateMessage): void {
  for (const playerId of wsConnections.keys()) {
    sendToClient(playerId, message)
  }
}

/**
 * Get list of connected player IDs
 */
export function getConnectedPlayerIds(): string[] {
  return Array.from(wsConnections.keys())
}
