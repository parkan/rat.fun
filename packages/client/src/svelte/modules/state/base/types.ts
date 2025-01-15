import { ENTITY_TYPE } from "contracts/enums"
import { Hex } from "viem"

declare global {
  // * * * * * * * * * * * * * * * * *
  // DEFAULT ENTITY TYPE
  // * * * * * * * * * * * * * * * * *

  type GameEvent = {
    blockNumber: string
  }

  type Entity = {
    [key: string]: any,
    entityType?: ENTITY_TYPE,
    name?: string,
    currency?: number,
    // Stats
    health?: number,
    intelligence?: number,
    strength?: number,
    sanity?: number,
    luck?: number,
    // Traits
    trait?: string,
    ownedRat?: Hex,
    owner?: Hex,
    roomPrompt?: string,
    roomIndex?: number,
  }

  type Player  = {
    [key: string]: any,
    entityType: ENTITY_TYPE.PLAYER,
    currency: number,
    ownedRat: Hex,
  }

  type Rat  = {
    [key: string]: any,
    entityType: ENTITY_TYPE.RAT,
    owner: Hex,
    health: number,
    intelligence: number,
    strength: number,
    sanity: number,
    luck: number,
    trait: string
  }

  type Room = {
    [key: string]: any,
    entityType: ENTITY_TYPE.ROOM,
    roomIndex: number,
    roomPrompt: string
  }

  // * * * * * * * * * * * * * * * * *
  // GAME PLAY ENTITY TYPES
  // * * * * * * * * * * * * * * * * *

  type Entities = {
    [index: string]: Entity
  }

  type Players = {
    [index: string]: Player
  }

  type Rats = {
    [index: string]: Rat
  }

  type Rooms = {
    [index: string]: Room
  }
}