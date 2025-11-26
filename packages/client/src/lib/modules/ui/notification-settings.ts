import { LocalStorage } from "$lib/modules/state/local.svelte"

// Store for tracking if player notifications are enabled (persisted to localStorage)
export const playerNotificationsEnabled = new LocalStorage<boolean>("playerNotificationsEnabled", true)

// Store for tracking if trip notifications are enabled (persisted to localStorage)
export const tripNotificationsEnabled = new LocalStorage<boolean>("tripNotificationsEnabled", true)
