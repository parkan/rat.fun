import { FastifyPluginAsync } from "fastify"
import { getPool } from "../db.js"
import { getLastSyncedBlockNumber } from "../utils.js"

const healthz: FastifyPluginAsync = async fastify => {
  fastify.get("/healthz", async (_request, reply) => {
    const appVersion = process.env.APP_VERSION || "unknown"
    try {
      const pool = getPool()
      await pool.query("SELECT 1")
      const lastSyncedBlock = await getLastSyncedBlockNumber()
      return reply.send({
        status: "ok",
        database: "connected",
        app_version: appVersion,
        last_synced_block: lastSyncedBlock
      })
    } catch (error) {
      return reply.status(503).send({
        status: "error",
        database: "disconnected",
        app_version: appVersion,
        last_synced_block: "0",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  })
}

export default healthz
