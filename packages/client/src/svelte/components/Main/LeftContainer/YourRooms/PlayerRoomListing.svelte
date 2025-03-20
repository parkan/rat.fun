<script lang="ts">
  import { playerRooms } from "@modules/state/base/stores"
  import RoomItem from "@svelte/components/Main/Shared/RoomItem/RoomItem.svelte"
</script>

<div class="player-room-listing">
  <div class="player-room-listing-items">
    {#each Object.entries($playerRooms) as [roomId, room]}
      <RoomItem {roomId} {room} />
    {/each}
  </div>
</div>

<style lang="scss">
  .player-room-listing {
    height: var(--player-room-listing-height);
    overflow-y: auto;
    scrollbar-width: none;
  }
</style>
