import Fastify from 'fastify'
import formbody from '@fastify/formbody';
// import compress from '@fastify/compress';
import cors from '@fastify/cors';

import test from './routes/test';
import enterRoom from './routes/enter-room';

const PORT = 3131;

const fastify = Fastify({   logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
 })

// Register the formbody plugin for application/x-www-form-urlencoded
fastify.register(formbody);

// Register the compress plugin for response compression
// fastify.register(compress, {
//   global: true, // Apply compression globally
//   encodings: ['gzip', 'deflate'], // Supported encodings
// });

// Register the CORS plugin for Cross-Origin Resource Sharing
fastify.register(cors, {
  origin: '*', // Allow all origins (restrict for production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
});

// Register routes
fastify.register(test)
fastify.register(enterRoom)

const start = async (port: number) => {
    try {
        await fastify.listen({ port })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start(PORT)