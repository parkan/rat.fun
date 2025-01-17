/*
 *  Central store for all entities in the game.
 *
 */
import type { FalseOrTransform } from "@modules/off-chain-sync/types"
import { blockNumber } from "@modules/network"

import { writable, derived } from "svelte/store"
import { addressToId } from "@modules/utils"
import { ENTITY_TYPE } from "contracts/enums"
import { filterByEntitytype } from "./utils"
import { GAME_CONFIG_ID } from "./constants"

// * * * * * * * * * * * * * * * * *
// DEFAULT ENTITY TYPES
// * * * * * * * * * * * * * * * * *

/**
 * Mirror of the full on chain state.
 * Only ever written to via the update systems in module/ssystems
 */
export const entities = writable({} as Entities)

// * * * * * * * * * * * * * * * * *
// GAME CONFIG ENTITIES
// * * * * * * * * * * * * * * * * *

export const gameConfig = derived(
  entities,
  $entities => ($entities[GAME_CONFIG_ID]?.gameConfig || {}) as GameConfig
)

// * * * * * * * * * * * * * * * * *
// PLAYER STORES
// * * * * * * * * * * * * * * * * *

export const playerAddress = writable("0x0" as string)

// Address in padded format
export const playerId = derived(playerAddress, $playerAddress =>
  addressToId($playerAddress)
)

export const player = derived(
  [entities, playerId],
  ([$entities, $playerId]) => $entities[$playerId] as Player
)

// * * * * * * * * * * * * * * * * *
// GAME ELEMENT STORES
// * * * * * * * * * * * * * * * * *

export const players = derived(entities, $entities => filterByEntitytype($entities, ENTITY_TYPE.PLAYER) as Players)
export const rats = derived(entities, $entities => filterByEntitytype($entities, ENTITY_TYPE.RAT) as Rats)
export const rooms = derived(entities, $entities => filterByEntitytype($entities, ENTITY_TYPE.ROOM) as Rooms)
export const traits = derived(entities, $entities => filterByEntitytype($entities, ENTITY_TYPE.TRAIT) as Traits)

// * * * * * * * * * * * * * * * * *
// PLAYER RAT STORES
// * * * * * * * * * * * * * * * * *

export const playerRat = derived(
  [player, rats],
  ([$player, $rats]) => $rats[$player?.ownedRat] as Rat
)

export const playerRatTraits = derived(
  [playerRat, traits],
  ([$playerRat, $traits]) => $playerRat?.traits?.map(trait => $traits[trait]) as Trait[]
)

// export const playerRemainingCooldown = derived(
//   [player, blockNumber],
//   ([$player, $blockNumber]) => {
//     if (!$player) return 0
//     return Math.max(
//       0,
//       (Number($player.cooldown) ?? 0) + COOLDOWN_PERIOD - Number($blockNumber)
//     )
//   }
// )
