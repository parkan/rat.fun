/*
 * ========================================
 * state/stores.ts
 * ========================================
 * Central store for all entities in the game.
 */

import { writable, derived } from "svelte/store"
import { blockNumber, publicNetwork } from "$lib/modules/network"
import { ENTITY_TYPE } from "contracts/enums"
import { filterByEntitytype, filterDepleted, filterNonDepleted } from "./utils"
import { staticContent } from "$lib/modules/content"
import { WORLD_OBJECT_ID } from "./constants"
import { readMultipleERC20Balances } from "$lib/modules/erc20"
import { idToAddress } from "@ratfun/shared-utils"
import { Hex } from "viem"

// * * * * * * * * * * * * * * * * *
// DEFAULT ENTITY TYPES
// * * * * * * * * * * * * * * * * *

/**
 * Mirror of the full on chain state.
 * Only ever written to via the update systems in module/ssystems
 */
export const entities = writable({} as Entities)

// * * * * * * * * * * * * * * * * *
// WORLD OBJECT ENTITIES
// * * * * * * * * * * * * * * * * *

export const worldObject = derived(
  entities,
  $entities => ($entities[WORLD_OBJECT_ID] || {}) as WorldObject
)

// GAME CONFIG
export const gameConfig = derived(worldObject, $worldObject => $worldObject.gameConfig)

// GAME PERCENTAGES CONFIG
export const gamePercentagesConfig = derived(
  worldObject,
  $worldObject => $worldObject.gamePercentagesConfig
)

// WORLD STATS
export const worldStats = derived(worldObject, $worldObject => $worldObject.worldStats)

// EXTERNAL ADDRESSES CONFIG
export const externalAddressesConfig = derived(
  worldObject,
  $worldObject => $worldObject.externalAddressesConfig
)

// WORLD EVENT
export const worldEvent = derived(worldObject, $worldObject => $worldObject.worldEvent)
export const activeWorldEvent = derived(
  [worldEvent, blockNumber],
  ([$worldEvent, $blockNumber]) => {
    if (!$worldEvent) {
      return undefined
    }
    if ($worldEvent.expirationBlock < $blockNumber) {
      return undefined
    }
    return $worldEvent
  }
)
export const activeWorldEventContent = derived(
  [staticContent, activeWorldEvent],
  ([$staticContent, $activeWorldEvent]) => {
    if (!$activeWorldEvent || !$staticContent.worldEvents) return undefined

    const event = $staticContent?.worldEvents.find(e => e._id === $activeWorldEvent.cmsId)

    if (event) {
      return event
    }

    return undefined
  }
)

// * * * * * * * * * * * * * * * * *
// GAME ELEMENT STORES
// * * * * * * * * * * * * * * * * *

export const players = derived(
  entities,
  $entities => filterByEntitytype($entities, ENTITY_TYPE.PLAYER) as Players
)
export const rats = derived(
  entities,
  $entities => filterByEntitytype($entities, ENTITY_TYPE.RAT) as Rats
)
export const trips = derived(
  entities,
  $entities => filterByEntitytype($entities, ENTITY_TYPE.TRIP) as Trips
)
export const items = derived(
  entities,
  $entities => filterByEntitytype($entities, ENTITY_TYPE.ITEM) as Items
)

// Derived

export const inactiveRats = derived(rats, $rats => filterDepleted($rats))
export const activeRats = derived(rats, $rats => filterNonDepleted($rats))
export const inactiveTrips = derived(trips, $trips => filterNonDepleted($trips))
export const activeTrips = derived(trips, $trips => filterNonDepleted($trips))

// * * * * * * * * * * * * * * * * *
// ERC20 BALANCES
// * * * * * * * * * * * * * * * * *

/**
 * Store for ERC20 balances of all player addresses
 */
export const playerERC20Balances = writable<Record<string, number>>({})

/**
 * Fetch ERC20 balances for all players
 * This should be called periodically or on-demand to update balances
 */
export async function fetchPlayerERC20Balances() {
  const $players = players
  const $publicNetwork = publicNetwork
  const $externalAddressesConfig = externalAddressesConfig

  // Get current values
  let currentPlayers: Players = {}
  let currentPublicNetwork: any = null
  let currentExternalAddresses: ExternalAddressesConfigObject | undefined = undefined

  const unsubPlayers = $players.subscribe(value => {
    currentPlayers = value
  })
  const unsubNetwork = $publicNetwork.subscribe(value => {
    currentPublicNetwork = value
  })
  const unsubExternal = $externalAddressesConfig.subscribe(value => {
    currentExternalAddresses = value
  })

  unsubPlayers()
  unsubNetwork()
  unsubExternal()

  // Get erc20 address from config (type comes from MUD schema)
  const erc20Address = (currentExternalAddresses as { erc20Address?: Hex } | undefined)
    ?.erc20Address

  if (!currentPublicNetwork || !erc20Address || !Object.keys(currentPlayers).length) {
    return
  }

  try {
    const playerIds = Object.keys(currentPlayers)
    // Convert padded entity IDs to actual Ethereum addresses
    const playerAddresses = playerIds.map(id => idToAddress(id) as Hex)

    const balances = await readMultipleERC20Balances(
      currentPublicNetwork,
      playerAddresses,
      erc20Address
    )

    // Map balances back to entity IDs
    const balancesByEntityId: Record<string, number> = {}
    playerIds.forEach((id, index) => {
      balancesByEntityId[id] = balances[playerAddresses[index]]
    })

    playerERC20Balances.set(balancesByEntityId)
  } catch (error) {
    console.error("Failed to fetch player ERC20 balances:", error)
  }
}

/**
 * Players with their ERC20 balances merged in
 */
export const playersWithERC20Balances = derived(
  [players, playerERC20Balances],
  ([$players, $balances]) => {
    const playersWithBalances: Players = {}

    Object.entries($players).forEach(([address, player]) => {
      playersWithBalances[address] = {
        ...player,
        erc20Balance: $balances[address] ?? 0
      }
    })

    return playersWithBalances
  }
)
