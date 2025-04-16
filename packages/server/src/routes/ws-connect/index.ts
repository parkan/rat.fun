import { FastifyInstance, FastifyRequest } from 'fastify';
import { schema } from '@routes/ws-connect/schema';
import { broadcast, wsConnections } from '@modules/websocket';
import { WebSocketParams, Message } from './types';

async function routes(fastify: FastifyInstance) {
  fastify.get(
    '/ws/:playerId',
    { websocket: true, schema: schema },
    (socket, req: FastifyRequest<WebSocketParams>) => {
      const { playerId } = req.params;

      // Store the WebSocket connection
      wsConnections[playerId] = socket;
      console.log(`WebSocket connected for Player ID: ${playerId}`);

      console.log('Object.keys(wsConnections)', Object.keys(wsConnections))

      // Broadcast updated client list to all connected clients
      broadcast("clients__update", Object.keys(wsConnections));

      // Add ping-pong handler
      socket.on('message', (message: Message) => {
        const data = JSON.parse(message.toString());
        if (data.topic === 'test') {
          socket.send(JSON.stringify({ topic: 'test', message: 'pong' }));
        }
      });

      socket.on('close', () => {
        console.log(`WebSocket closed for Player ID: ${playerId}`);
        delete wsConnections[playerId]; // Clean up connection
        // Broadcast updated client list to all connected clients
        broadcast("clients__update", Object.keys(wsConnections));
      });
    }
  );
}

export default routes;
