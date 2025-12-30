import type { Hex } from "viem"
import { ENTITY_TYPE } from "contracts/enums"
import { get } from "svelte/store"
import { WALLET_TYPE } from "@ratfun/common/basic-network"
import { SetupWalletNetworkResult } from "@ratfun/common/mud"
import { walletNetwork, walletType } from "$lib/modules/network"
import { playerAddress, entities } from "$lib/modules/state/stores"
import { addressToId } from "@ratfun/shared-utils"
import { createLogger } from "$lib/modules/logger"

const logger = createLogger("[WalletNetwork]")

/**
 * Initialize the wallet network - sets up stores.
 */
export function initWalletNetwork(
  wallet: SetupWalletNetworkResult,
  address: Hex,
  type: WALLET_TYPE
): void {
  walletType.set(type)
  walletNetwork.set(wallet)
  playerAddress.set(address)
}

/**
 * Check if a player is spawned without initializing anything.
 * Use this when you just need to check spawn status.
 *
 * @param address - The player's wallet address
 * @returns true if the player entity exists and is of type PLAYER
 */
export function checkIsSpawned(address: Hex): boolean {
  const playerId = addressToId(address)
  const allEntities = get(entities)
  const playerEntity = allEntities[playerId]
  const isSpawned = playerEntity?.entityType === ENTITY_TYPE.PLAYER

  logger.log("checkIsSpawned:", {
    playerId,
    entityCount: Object.keys(allEntities).length,
    hasPlayerEntity: !!playerEntity,
    isSpawned
  })

  return isSpawned
}
