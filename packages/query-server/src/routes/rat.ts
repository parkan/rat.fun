import { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { query } from "../db.js"
import { formatEther } from "viem"

// The MUD postgres-decoded indexer stores tables with format:
// Schema: {world_address_lowercase}
// Table: {namespace}__{tablename} (lowercase snake_case)
// Key column: "id" (bytes32) for shorthand tables
// Value column: "value" for shorthand tables

const NAMESPACE = "ratfun"

// Schema is the world address in lowercase
function getSchemaName(): string {
  const worldAddress = process.env.WORLD_ADDRESS
  if (!worldAddress) {
    throw new Error("WORLD_ADDRESS environment variable is required")
  }
  return worldAddress.toLowerCase()
}

// Request schema
const getRatSchema = z.object({
  id: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid bytes32 id format")
})

// Response type
interface RatInfo {
  id: string
  name: string | null
  value: string | null
  balance: string | null
  dead: boolean
  liquidated: boolean
  liquidationValue: string | null
  liquidationBlock: string | null
  owner: string | null
  index: string | null
  tripCount: string | null
  creationBlock: string | null
  inventory: string[]
}

// Convert table name to snake_case (e.g., "TripCount" -> "trip_count")
function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
}

// Convert hex string (0x...) to bytea parameter for PostgreSQL
function hexToByteaParam(hex: string): Buffer {
  // Remove 0x prefix and convert to Buffer
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex
  return Buffer.from(cleanHex, "hex")
}

// Query a single value from a MUD table
async function getTableValue<T>(
  tableName: string,
  entityId: string,
  column: string
): Promise<T | null> {
  const schema = getSchemaName()
  const snakeTableName = toSnakeCase(tableName)
  const fullTableName = `${NAMESPACE}__${snakeTableName}`
  // Use schema-qualified table name and "id" as the key column
  // id is stored as bytea, so we need to pass a Buffer
  const sql = `SELECT "${column}" FROM "${schema}"."${fullTableName}" WHERE "id" = $1 LIMIT 1`

  try {
    const result = await query<Record<string, T>>(sql, [hexToByteaParam(entityId)])
    if (result.rows.length === 0) return null
    return result.rows[0][column] ?? null
  } catch (error) {
    // Table might not exist or column not found
    console.error(`Error querying ${schema}.${fullTableName}.${column}:`, error)
    return null
  }
}

// Query array value from a MUD table (for Inventory)
async function getArrayValue(tableName: string, entityId: string): Promise<string[]> {
  const schema = getSchemaName()
  const snakeTableName = toSnakeCase(tableName)
  const fullTableName = `${NAMESPACE}__${snakeTableName}`
  // For array tables, the value is stored as the array directly
  const sql = `SELECT "value" FROM "${schema}"."${fullTableName}" WHERE "id" = $1`

  try {
    const result = await query<{ value: string[] | string }>(sql, [hexToByteaParam(entityId)])
    if (result.rows.length === 0) return []
    // Value might be an array or a single value depending on how it's stored
    const val = result.rows[0].value
    return Array.isArray(val) ? val : [val]
  } catch (error) {
    console.error(`Error querying ${schema}.${fullTableName}:`, error)
    return []
  }
}

const rat: FastifyPluginAsync = async fastify => {
  fastify.get<{ Params: { id: string } }>("/api/rat/:id", async (request, reply) => {
    const validation = getRatSchema.safeParse(request.params)
    if (!validation.success) {
      return reply.status(400).send({
        error: "Invalid request",
        details: validation.error.issues
      })
    }

    const { id } = validation.data

    // Query all rat-related data in parallel
    const [
      name,
      value,
      balance,
      dead,
      liquidated,
      liquidationValue,
      liquidationBlock,
      owner,
      index,
      tripCount,
      creationBlock,
      inventory
    ] = await Promise.all([
      getTableValue<string>("Name", id, "value"),
      getTableValue<string>("Value", id, "value"),
      getTableValue<string>("Balance", id, "value"),
      getTableValue<boolean>("Dead", id, "value"),
      getTableValue<boolean>("Liquidated", id, "value"),
      getTableValue<string>("LiquidationValue", id, "value"),
      getTableValue<string>("LiquidationBlock", id, "value"),
      getTableValue<string>("Owner", id, "value"),
      getTableValue<string>("Index", id, "value"),
      getTableValue<string>("TripCount", id, "value"),
      getTableValue<string>("CreationBlock", id, "value"),
      getArrayValue("Inventory", id)
    ])

    // Check if this entity exists (has at least a name or creationBlock)
    if (!name && !creationBlock) {
      return reply.status(404).send({
        error: "Rat not found",
        id
      })
    }

    const ratInfo: RatInfo = {
      id,
      name,
      value: value ? formatEther(BigInt(value)) : null,
      balance: balance ? formatEther(BigInt(balance)) : null,
      dead: dead ?? false,
      liquidated: liquidated ?? false,
      liquidationValue: liquidationValue ? formatEther(BigInt(liquidationValue)) : null,
      liquidationBlock,
      owner,
      index,
      tripCount,
      creationBlock,
      inventory
    }

    return reply.send(ratInfo)
  })
}

export default rat
