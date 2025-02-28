<script lang="ts">
  import { ratLevel, roomsOnRatLevel } from "@modules/state/base/stores"

  import { UILocation } from "@modules/ui/stores"
  import { LOCATION } from "@modules/ui/enums"

  import RoomItem from "@components/Room/RoomItem.svelte"
  // import NewRoom from "@components/Room/NewRoom.svelte"
  import ClientStats from "@components/Elements/ClientStats/ClientStats.svelte"
</script>

<ClientStats />

<div class="nest-link">
  <button on:click={() => UILocation.set(LOCATION.NEST)}>Go to nest</button>
</div>

<div class="room-container">
  <!-- <div class="level">
      <h2>Level: {$ratLevel?.index ?? 0}</h2>
    </div> -->
  <!-- CREATE ROOM-->
  <!-- {#if ($ratLevel?.index ?? 0) > 1} -->
  <!-- <NewRoom /> -->
  <!-- {/if} -->
  <!-- ROOM LIST -->
  <div class="room-list">
    {#each Object.entries($roomsOnRatLevel).reverse() as [roomId, room]}
      <RoomItem {roomId} {room} />
    {/each}
  </div>
</div>

<style lang="scss">
  .stat-item {
    margin-bottom: 10px;
    display: flex;

    .label {
      margin-right: 0.5em;
    }

    .inner-wrapper {
      display: inline-flex;
      padding: 5px;

      &.balance {
        background: var(--color-value);
        color: var(--black);
      }

      &.rat-keeper {
        background: var(--color-alert);
        color: var(--black);
      }

      &.rat {
        background: var(--color-alert);
        color: var(--black);
      }

      &.health {
        background: var(--color-health);
        color: var(--black);
      }

      &.dead {
        background: var(--color-death);
        color: var(--white);
      }
    }
  }

  .action {
    button {
      padding: 5px;
      color: var(--black);
      cursor: pointer;
      margin-left: 20px;
    }
  }

  .nest-link {
    position: fixed;
    bottom: 20px;
    right: 20px;
    button {
      padding: 20px;
      font-size: 48px;
    }
  }

  .room-container {
    height: 100vh;
    width: 50vw;
    overflow-y: auto;
    padding-bottom: 100px;
  }
</style>
