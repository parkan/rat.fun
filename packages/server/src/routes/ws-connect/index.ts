import { FastifyInstance, FastifyRequest } from 'fastify';
import { schema } from '@routes/ws-connect/schema';
import { broadcast, wsConnections } from '@modules/websocket';

// Define the type of the request parameters
interface WebSocketParams {
  Params: {
    ratId: string;
  };
}

async function routes(fastify: FastifyInstance) {
  fastify.get(
    '/ws/:ratId',
    { websocket: true, schema: schema },
    (socket, req: FastifyRequest<WebSocketParams>) => {
      const { ratId } = req.params;

      // Store the WebSocket connection
      wsConnections[ratId] = socket;
      console.log(`WebSocket connected for Rat ID: ${ratId}`);

      // Broadcast updated client list to all connected clients
      broadcast("clients__update", Object.keys(wsConnections));

      socket.on('close', () => {
        console.log(`WebSocket closed for Rat ID: ${ratId}`);
        delete wsConnections[ratId]; // Clean up connection
        // Broadcast updated client list to all connected clients
        broadcast("clients__update", Object.keys(wsConnections));
      });

    }
  );
}

export default routes;
