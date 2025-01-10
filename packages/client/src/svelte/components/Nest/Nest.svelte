<script lang="ts">
  import { player, rats, rooms } from "@svelte/modules/state/base/stores"
  import RoomItem from "./RoomItem.svelte"
  import { ENVIRONMENT } from "@mud/enums"

  export let environment: ENVIRONMENT
</script>

<div class="nest">
  <div class="column first">
    {#if $player}
      <div class="stats">
        <strong>PLAYER</strong>
        <!-- <br />id: {$playerId} -->
        <br />Currency:{$player.currency ?? 0}
      </div>
      <img src="/images/rat.jpg" alt="nest" />
      <div class="stats">
        <strong>RAT</strong>
        <!-- <br />id: {$player.ownedRat} -->
        <br />Trait: {$rats[$player.ownedRat]?.trait ?? 0}
        <br />Health: {$rats[$player.ownedRat]?.health ?? 0}
        <br />Energy: {$rats[$player.ownedRat]?.energy ?? 0}
      </div>
    {/if}
  </div>

  <div class="column second">
    <!-- ROOM LIST -->
    <div class="room-list">
      {#each Object.entries($rooms) as [roomId, room]}
        <RoomItem {environment} {roomId} {room} />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  strong {
    font-size: 32px;
  }

  .stats {
    margin-bottom: 20px;
  }

  img {
    margin-bottom: 20px;
  }

  .column {
    width: 50%;
    height: 100vh;
    float: left;
    padding: 20px;
    overflow: hidden;

    &.first {
      background: blue;
    }

    &.second {
      background: red;
    }
  }
</style>
