<script lang="ts">
  import {
    player,
    playerId,
    rats,
    rooms,
  } from "@svelte/modules/state/base/stores"

  import RoomItem from "./RoomItem.svelte"
</script>

<div class="nest">
  <div class="column first">
    <div>
      <strong>PLAYER</strong>
      <br />id: {$playerId}
      <br />Currency:{$player.currency}
    </div>
    <img src="/images/rat.jpg" alt="nest" />
    <div>
      <strong>RAT</strong>
      <br />id: {$player.ownedRat}
      <br />Trait: {$rats[$player.ownedRat].trait}
      <br />Health: {$rats[$player.ownedRat].health}
      <br />Energy: {$rats[$player.ownedRat].energy}
    </div>
  </div>

  <div class="column second">
    <!-- ROOM LIST -->
    <div class="room-list">
      {#each Object.entries($rooms) as [roomId, room]}
        <RoomItem {roomId} {room} />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
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

  .room {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(60, 60, 60);
    padding: 20px;
  }

  button {
    padding: 40px;
    font-size: 32px;
    margin-top: 20px;
    cursor: pointer;
  }

  .outcome {
    font-weight: bold;
    background: black;
    color: white;
    margin-top: 20px;
  }

  .loader {
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>
