import { writable } from "svelte/store"

export interface OnlinePlayer {
  id: string
  name: string
}

export const websocketConnected = writable(false)
export const onlinePlayers = writable<OnlinePlayer[]>([])
