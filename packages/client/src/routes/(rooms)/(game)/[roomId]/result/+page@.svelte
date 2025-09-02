<script lang="ts">
  import type { FrozenRat, FrozenRoom } from "$lib/components/Room/RoomResult/types"
  import type { EnterRoomReturnValue } from "@server/modules/types"
  import type { Snapshot } from "./$types"
  import { onMount } from "svelte"
  import { replaceState, goto } from "$app/navigation"
  import { page } from "$app/state"
  import { RoomResult } from "$lib/components/Room"
  import { sendEnterRoom } from "$lib/modules/action-manager/index.svelte"
  import { RoomError, APIError, NetworkError } from "$lib/modules/error-handling/errors"
  import { player, rooms as roomsState, rat } from "$lib/modules/state/stores"
  import { freezeObjects, stringifyWithBigInt, parseWithBigInt } from "$lib/components/Room/RoomResult/state.svelte"

  // Incoming data
  let { data } = $props()

  let entryState = $state<{
    valid: boolean
    processing: boolean
    result: EnterRoomReturnValue | null
    error: boolean
    frozenRat: FrozenRat | null
    frozenRoom: FrozenRoom | null
  }>({
    valid: false,
    processing: false,
    result: null,
    error: false,
    frozenRat: null,
    frozenRoom: null
  })

  let room = $derived($roomsState?.[data.roomId ?? ""])

  // Capture a snapshot of the currently processing state
  export const snapshot: Snapshot = {
    capture: () => {
      const captureData = {
        valid: entryState.valid,
        processing: entryState.processing,
        timestamp: Date.now(),
        frozenRat: entryState.frozenRat,
        frozenRoom: entryState.frozenRoom
      }
      return JSON.parse(stringifyWithBigInt(captureData))
    },
    restore: value => {
      console.log("Restoring while entering")
      if (value?.valid && Date.now() - value.timestamp < 300000) {
        const parsed = parseWithBigInt(stringifyWithBigInt(value))
        entryState.valid = true
        entryState.processing = parsed.processing || false
        entryState.frozenRat = parsed.frozenRat
        entryState.frozenRoom = parsed.frozenRoom
      }
    }
  }

  // Process the room
  const processRoomEntry = async () => {
    if (entryState.processing || !data.roomId) return
    entryState.processing = true

    try {
      const { frozenRat, frozenRoom } = freezeObjects(
        $rat,
        room,
        data.roomId as `0x${string}`,
        $player.currentRat
      )
      entryState.frozenRat = frozenRat
      entryState.frozenRoom = frozenRoom

      const result = await sendEnterRoom(data.roomId, $player.currentRat)

      if (!result) {
        throw new RoomError("No result returned from trip entry", data.roomId)
      }

      // Determine what to do based on the result
      if (result?.outcomeId) {
        await goto(`/${data.roomId}/${result.outcomeId}`)
      } else if (result) {
        entryState.result = result
      } else {
        goto("/")
      }
    } catch (err) {
      entryState.error = true
      if (err instanceof Error) {
        if (err.message.includes("network") || err.message.includes("fetch")) {
          throw new NetworkError(
            "ROOM_ENTRY_NETWORK_ERROR",
            "Network error during room entry",
            err.message
          )
        } else if (err.message.includes("api") || err.message.includes("server")) {
          throw new APIError("Trip entry API error: " + err.message, err)
        } else {
          throw new RoomError("Trip entry failed: " + err.message, data.roomId)
        }
      }
    }
  }

  onMount(async () => {
    console.log("on mount, and we have data", data.roomId)
    const shouldEnter = page.url.searchParams.get("enter") === "true"
    const ratId = page.url.searchParams.get("rat")
    const timestamp = parseInt(page.url.searchParams.get("t") || "0")

    if (shouldEnter && ratId === $player.currentRat && Date.now() - timestamp < 30000) {
      console.log("We can start getting the result")
      entryState.valid = true
      replaceState(`/${data.roomId}/result`, {})
      await processRoomEntry()
    } else if (!entryState.valid) {
      console.log("We mounted and we cannot enter")
      await goto("/")
    }
  })
</script>

<RoomResult
  roomId={data.roomId}
  valid={entryState.valid}
  hasError={entryState.error}
  result={entryState.result}
/>
