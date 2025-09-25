<script lang="ts">
  import type { Hex } from "viem"
  import type { EnterRoomReturnValue } from "@server/modules/types"

  import { onMount } from "svelte"
  import { TRIP_STATE } from "$lib/components/GameRun/state.svelte"
  import { staticContent } from "$lib/modules/content"
  import { roomResultState } from "$lib/components/GameRun/state.svelte"
  import { transitionTo } from "$lib/components/GameRun/state.svelte"
  import { sendEnterRoom } from "$lib/modules/action-manager/actions/sendEnterRoom"
  import { NetworkError, APIError } from "$lib/modules/error-handling/errors"
  import { RoomError } from "$lib/modules/error-handling/errors"
  import { player } from "$lib/modules/state/stores"
  import { TripSetup, TripProcessing, TripReport } from "$lib/components/GameRun"
  import { replaceState } from "$app/navigation"
  import { freezeObjects } from "$lib/components/GameRun/state.svelte"
  import { rat, rooms } from "$lib/modules/state/stores"

  let {
    roomId
  }: {
    roomId: Hex
  } = $props()

  let result = $state<EnterRoomReturnValue | null>(null)

  // Get static room content from cms
  let staticRoomContent = $derived($staticContent.rooms.find(r => r._id == (roomId ?? "")))

  // Process the room
  const processRoomEntry = async () => {
    try {
      result = await sendEnterRoom(roomId, $player.currentRat)
      if (!result) {
        throw new RoomError("No result returned from trip entry", roomId)
      }
    } catch (err) {
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
          throw new RoomError("Trip entry failed: " + err.message, roomId)
        }
      }
    }
  }

  onMount(() => {
    console.log("### onMount ###")
    console.log("### roomResultState ###", roomResultState)
    // Clean the URL
    replaceState(`/${roomId}/tripping`, {})

    console.log("### roomId ###", roomId)

    const room = $rooms[roomId]
    console.log("### room ###", room)

    // Freeze the rat and room to be able to gradually update their values without reactivity
    // from on-chain changes.
    freezeObjects($rat, room, roomId, $player.currentRat)

    // Process the room entry
    processRoomEntry()
  })
</script>

<div class="trip">
  <!-- ### 1. TRIP SETUP ### -->
  {#if roomResultState.state === TRIP_STATE.SETUP}
    <TripSetup
      {staticRoomContent}
      onComplete={() => {
        transitionTo(TRIP_STATE.PROCESSING)
      }}
    />
  {/if}

  <!-- ### 2. TRIP PROCESSING ### -->
  {#if roomResultState.state === TRIP_STATE.PROCESSING}
    <TripProcessing
      {result}
      onComplete={async () => {
        transitionTo(TRIP_STATE.RESULTS)
      }}
    />
  {/if}

  <!-- ### 3. TRIP RESULTS ### -->
  {#if roomResultState.state === TRIP_STATE.RESULTS}
    <TripReport {result} />
  {/if}
</div>

<style lang="scss">
  .trip {
    height: 100%;
    color: var(--white);
    z-index: var(--z-high);
    font-size: var(--font-size-normal);
    overflow-y: auto;
    top: 32px;
  }
</style>
