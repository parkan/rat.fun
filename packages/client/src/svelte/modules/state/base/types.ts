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
    energy?: number,
    health?: number,
    trait?: string,
    ownedRat?: Hex,
    owner?: Hex,
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
    energy: number,
    trait: string
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
}