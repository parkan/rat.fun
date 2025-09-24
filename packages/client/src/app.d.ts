// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { RoomEntryState } from "$lib/components/GameRun/types"

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    interface PageState {
      entryState: RoomEntryState
    }
    // interface Platform {}
  }
}

export {}
