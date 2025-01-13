import { FastifyInstance } from "fastify"

async function routes (fastify: FastifyInstance, options: Object) {
    fastify.get('/test/ping', async (request, reply) => {
        return { message: 'pong' }
    })
}

export default routes;