import { resourceToHex } from "@latticexyz/common"
import { parseAbi, ClientConfig } from "viem"
import worldConfig from "@latticexyz/world/mud.config"

/**
 * Default viem client configuration
 * Polling interval for watching blockchain state
 */
export const defaultClientConfig = {
  pollingInterval: 250
} as const satisfies Pick<ClientConfig, "pollingInterval">

/**
 * MUD delegation control ID for "unlimited" delegation
 *
 * This is a resource ID that identifies the unlimited delegation control system.
 * When a user delegates to a session account with this ID, the session account
 * can call any system in the World on behalf of the user.
 *
 * Format: system resource with namespace="" and name="unlimited"
 */
export const unlimitedDelegationControlId = resourceToHex({
  type: "system",
  namespace: "",
  name: "unlimited"
})

/**
 * MUD World table definitions from world config
 * Used to query World state (e.g., UserDelegationControl table)
 */
export const worldTables = worldConfig.namespaces.world.tables

/**
 * Minimal World ABI for delegation registration
 * Full ABI is large, we only need this one function
 */
export const worldAbi = parseAbi([
  "function registerDelegation(address delegatee, bytes32 delegationControlId, bytes initCallData)"
])
