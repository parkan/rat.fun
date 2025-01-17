<script lang="ts">
  import {
    player,
    playerRat,
    playerRatTraits,
    rooms,
  } from "@modules/state/base/stores"

  import { ENVIRONMENT } from "@mud/enums"

  import RoomItem from "@components/Nest/RoomItem.svelte"
  import NewRoom from "@components/Nest/NewRoom.svelte"

  export let environment: ENVIRONMENT
</script>

<div class="nest">
  <div class="column first">
    {#if $player}
      <img src="/images/rat.jpg" alt="nest" />
      <div class="stats">
        <div class="stat-item trait">
          <strong>Traits:</strong>
          {#if $playerRatTraits}
            {#each $playerRatTraits as trait}
              <div class="trait-item">{trait.name}</div>
            {/each}
          {/if}
        </div>
        <div class="stat-item">
          <strong>Dead:</strong>
          {$playerRat?.dead}
        </div>
        <div class="stat-item">
          <strong>Health:</strong>
          {$playerRat?.health ?? 0}
        </div>
        <div class="stat-item">
          <strong>Level:</strong>
          {$playerRat?.level ?? 0}
        </div>
      </div>
    {/if}
  </div>

  <div class="column second">
    <NewRoom />
    <!-- ROOM LIST -->
    <div class="room-list">
      {#each Object.entries($rooms).reverse() as [roomId, room]}
        <RoomItem {environment} {roomId} {room} />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
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
    overflow-x: hidden;
    overflow-y: auto;

    &.first {
      background: blue;
    }

    &.second {
      background: red;
    }
  }

  .stat-item {
    margin-bottom: 1em;
  }

  .trait {
    background: lightcyan;
    color: black;
    display: flex;
    flex-wrap: wrap;

    .trait-item {
      margin-right: 5px;
      margin-bottom: 5px;
      padding: 4px;
      border-radius: 5px;
      background: orangered;
      font-size: 14px;
    }
  }
</style>
