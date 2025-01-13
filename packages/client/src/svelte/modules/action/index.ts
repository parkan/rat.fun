import { addToSequencer } from "./actionSequencer"

const NAMESPACE = "ratroom__"

export enum WorldFunctions {
  Spawn = NAMESPACE + "spawn",
  CreateRoom = NAMESPACE + "createRoom",
}

// --- API --------------------------------------------------------------

export function spawn() {
  return addToSequencer(WorldFunctions.Spawn, [])
}

export function createRoom(prompt: string) {
  return addToSequencer(WorldFunctions.CreateRoom, [prompt])
}