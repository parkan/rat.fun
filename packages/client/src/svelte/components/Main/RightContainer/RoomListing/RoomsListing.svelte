<script lang="ts">
  import RoomItem from "@svelte/components/Main/Shared/RoomItem/RoomItem.svelte"
  import RoomPreview from "@svelte/components/Main/Shared/RoomPreview/RoomPreview.svelte"
  import {
    roomsOnRatLevel,
    ratLevelIndex,
    rooms as roomsState,
  } from "@modules/state/base/stores"
  import { getUIState } from "@modules/ui/state.svelte"

  let { yours } = $props()

  let { rooms } = getUIState()

  let currentRoom = $state<string | null>(null)

  const { current } = rooms

  let roomsList = $derived.by(() => {
    if (!yours) {
      return Object.entries($roomsOnRatLevel)
    } else {
      return Object.entries($roomsState)
    }
  })

  $effect(() => {
    if (!$current) {
      // Delayed
      setTimeout(() => (currentRoom = $current), 400)
    } else {
      // Instant
      currentRoom = $current
    }
  })
</script>

<div class="wrapper">
  <div class="rooms">
    <div class="floor-header">
      <div class="floor-title">Floor {$ratLevelIndex * -1}</div>
      <div class="floor-stats">
        {Object.values($roomsOnRatLevel).length} rooms
      </div>
      <div class="floor-filter">TODO: filters</div>
    </div>
    <div class="floor-content">
      <div class:previewing={$current} class="room-listing">
        {#each roomsList as [roomId, room]}
          <RoomItem {roomId} {room} />
        {/each}
      </div>
      <div class:previewing={$current} class="room-preview">
        {#if currentRoom}
          <RoomPreview
            roomId={currentRoom}
            room={$roomsOnRatLevel[currentRoom]}
          />
        {:else}
          <div>Empty</div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .wrapper {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .floor-header {
    line-height: 60px;
    border-bottom: 1px solid white;
    padding-inline: 20px;
    display: flex;
    justify-content: space-between;
  }

  .rooms {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-rows: 60px 1fr;
    grid-template-columns: 1fr;
  }

  .floor-content {
    position: relative;
  }

  .room-listing {
    overflow-y: scroll;
  }

  .room-preview,
  .room-listing {
    position: absolute;
    width: 100%;
    flex-basis: 100%;
    flex-shrink: 0;
    height: 100%;
    inset: 0;
    transition: transform 0.2s ease;
  }

  .room-preview {
    left: 100%;
  }

  .previewing {
    transform: translateX(-100%);
  }
</style>
