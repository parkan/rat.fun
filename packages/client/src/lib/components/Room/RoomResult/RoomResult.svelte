<script lang="ts">
  import type { EnterRoomReturnValue } from "@server/modules/types"
  import type { Hex } from "viem"
  import { onMount, onDestroy } from "svelte"
  import { player, rooms as roomsState, rat as ratState } from "$lib/modules/state/stores"
  import {
    ROOM_RESULT_STATE,
    SHOW_INFO_BOXES,
    SHOW_LOG,
    roomResultState,
    transitionTo,
    transitionToResultSummary
  } from "$lib/components/Room/RoomResult/state.svelte"
  import {
    SplashScreen,
    WaitingForResult,
    Log,
    RatInfoBox,
    RoomInfoBox,
    NormalResultSummary,
    RatDeadResultSummary,
    LevelUpResultSummary,
    LevelDownResultSummary
  } from "$lib/components/Room"
  import { staticContent } from "$lib/modules/content"
  import { sendEnterRoom } from "$lib/modules/action-manager/index.svelte"
  import { RoomError } from "$lib/modules/error-handling/errors"

  let {
    roomId,
    result: externalResult,
    valid,
    hasError = false
  }: {
    roomId: string | null
    result: EnterRoomReturnValue | null
    valid: boolean
    hasError?: boolean
  } = $props()

  // Result of the room entry, returned by the server
  let result: EnterRoomReturnValue | null = $state(externalResult)

  let timeout: ReturnType<typeof setTimeout> = $state()

  let destroyed = false

  // Get room info from global store based on id
  let room = $derived($roomsState?.[roomId ?? ""])

  $inspect(room)

  // Get static room content from cms
  let staticRoomContent = $derived($staticContent.rooms.find(r => r._id == (roomId ?? "")))

  $inspect(staticRoomContent)

  // const processRoom = async () => {
  //   if (!roomId) {
  //     throw new RoomError("No trip ID provided")
  //   }

  //   try {
  //     const ret = sendEnterRoom(roomId, $player.currentRat)

  //     try {
  //       result = await ret

  //       // Result returned, transition to showing results
  //       transitionTo(ROOM_RESULT_STATE.SHOWING_RESULTS)
  //     } catch (err) {
  //       console.log("catch outcome error", err)
  //       // Wrap the error in more specific error types based on the error

  //       throw err
  //     }
  //   } catch (error) {
  //     transitionTo(ROOM_RESULT_STATE.ERROR)
  //     return
  //   }
  // }

  onDestroy(() => {
    destroyed = true
    clearTimeout(timeout)
  })
</script>

<div class="room-result">
  <!-- SPLASH SCREEN -->
  {#if roomResultState.state === ROOM_RESULT_STATE.SPLASH_SCREEN}
    <SplashScreen
      {staticRoomContent}
      onComplete={() => {
        if (destroyed) return
        transitionTo(ROOM_RESULT_STATE.WAITING_FOR_RESULT)
      }}
    />
  {/if}

  <!-- INFO BOXES -->
  {#if SHOW_INFO_BOXES.includes(roomResultState.state)}
    <div class="info-boxes">
      <RatInfoBox />
      <div class="divider"></div>
      <RoomInfoBox {staticRoomContent} />
    </div>
  {/if}

  <!-- WAITING FOR RESULT -->
  {#if roomResultState.state === ROOM_RESULT_STATE.WAITING_FOR_RESULT}
    <WaitingForResult />
  {/if}

  <!-- LOG -->
  {#if SHOW_LOG.includes(roomResultState.state)}
    <Log
      {result}
      onComplete={() => {
        console.log(performance.now() + " Completed")
        timeout = setTimeout(() => {
          if (result) {
            transitionToResultSummary(result)
          }
        }, 500)
      }}
    />
  {/if}

  <!-- Result Summary: Normal -->
  {#if roomResultState.state === ROOM_RESULT_STATE.RESULT_SUMMARY_NORMAL}
    <NormalResultSummary {result} {room} {staticRoomContent} />
  {/if}

  <!-- Result Summary: Rat Dead -->
  {#if roomResultState.state === ROOM_RESULT_STATE.RESULT_SUMMARY_RAT_DEAD}
    <RatDeadResultSummary {result} {room} {staticRoomContent} />
  {/if}

  <!-- Result Summary: Level Up -->
  {#if roomResultState.state === ROOM_RESULT_STATE.RESULT_SUMMARY_LEVEL_UP}
    <LevelUpResultSummary {result} {room} {staticRoomContent} />
  {/if}

  <!-- Result Summary: Level Down -->
  {#if roomResultState.state === ROOM_RESULT_STATE.RESULT_SUMMARY_LEVEL_DOWN}
    <LevelDownResultSummary {result} {room} {staticRoomContent} />
  {/if}

  <!-- Error -->
  {#if roomResultState.state === ROOM_RESULT_STATE.ERROR}
    <div class="error">
      {roomResultState.errorMessage}
    </div>
  {/if}
</div>

<style lang="scss">
  .room-result {
    height: 100%;
    color: var(--white);
    z-index: var(--z-high);
    font-size: var(--font-size-normal);
    overflow-y: auto;
    top: 32px;
  }

  .info-boxes {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: var(--info-box-height);
  }

  .divider {
    width: 100px;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      #000000,
      #000000 20px,
      var(--color-grey-dark) 20px,
      var(--color-grey-dark) 40px
    );
    border: var(--default-border-style);
  }
</style>
