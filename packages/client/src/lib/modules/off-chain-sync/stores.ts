import { writable } from "svelte/store"

export const websocketConnected = writable(false)
export const clientList = writable([] as string[])
