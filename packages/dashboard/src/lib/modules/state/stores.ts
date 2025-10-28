/*
 * ========================================
 * state/stores.ts
 * ========================================
 * Central store for all entities in the game.
 */

import { writable, derived } from "svelte/store"
import { blockNumber } from "$lib/modules/network"
import { ENTITY_TYPE } from "contracts/enums"
import { filterByEntitytype, filterDepleted, filterNonDepleted } from "./utils"
import { staticContent } from "$lib/modules/content"
import { WORLD_OBJECT_ID } from "./constants"

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
