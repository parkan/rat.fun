import { ROOM_TYPE } from "contracts/enums"
import { addToSequencer } from "./actionSequencer"

const NAMESPACE = "ratroom__"

export enum WorldFunctions {
  Spawn = NAMESPACE + "spawn",
  LevelUp = NAMESPACE + "levelUp",
  CreateRat = NAMESPACE + "createRat",
  CreateRoom = NAMESPACE + "createRoom",
  transferItemToInventory = NAMESPACE + "transferItemToInventory",
  transferItemToLoadOut = NAMESPACE + "transferItemToLoadOut",
  transferBalanceToPlayer = NAMESPACE + "transferBalanceToPlayer",
  transferBalanceToRat = NAMESPACE + "transferBalanceToRat",
}

// --- API --------------------------------------------------------------

export function spawn(name: string) {
  return addToSequencer(WorldFunctions.Spawn, [name])
}

export function levelUp() {
  return addToSequencer(WorldFunctions.LevelUp, [])
}

export function createRoom(prompt: string, roomType: ROOM_TYPE) {
  return addToSequencer(WorldFunctions.CreateRoom, [prompt, roomType])
}

export function createRat() {
  return addToSequencer(WorldFunctions.CreateRat, [])
}

export function transferItemToInventory(itemId: string) {
  return addToSequencer(WorldFunctions.transferItemToInventory, [itemId])
}

export function transferItemToLoadOut(itemId: string) {
  return addToSequencer(WorldFunctions.transferItemToLoadOut, [itemId])
}

export function transferBalanceToPlayer(amount: number) {
  return addToSequencer(WorldFunctions.transferBalanceToPlayer, [amount])
}

export function transferBalanceToRat(amount: number) {
  return addToSequencer(WorldFunctions.transferBalanceToRat, [amount])
}