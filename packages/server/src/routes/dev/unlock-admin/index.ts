import { FastifyInstance, FastifyRequest } from "fastify"
import { systemCalls } from "@modules/mud/initMud"
import { Hex } from "viem"
import { schema } from "./schema"

interface UnlockAdminBody {
  id: string
}

const opts = { schema }

async function routes(fastify: FastifyInstance, options: object) {
  fastify.post(
    "/dev/unlock-admin",
    opts,
    async (request: FastifyRequest<{ Body: UnlockAdminBody }>, reply) => {
      // Only allow in local development (anvil)
      const chainId = Number(process.env.CHAIN_ID)
      if (chainId !== 31337) {
        return reply.status(403).send({
          success: false,
          error: "This endpoint is only available in local development"
        })
      }

      try {
        const { id } = request.body

        if (!id) {
          return reply.status(400).send({
            success: false,
            error: "Missing required field: id"
          })
        }

        // Give master key to the player
        await systemCalls.giveMasterKey(id as Hex)

        return reply.status(200).send({
          success: true,
          message: "Cashboard unlocked"
        })
      } catch (error) {
        console.error("Error unlocking admin:", error)
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }
  )
}

export default routes
