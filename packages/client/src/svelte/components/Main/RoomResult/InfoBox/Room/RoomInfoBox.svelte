<script lang="ts">
  import { frozenRoom } from "@components/Main/RoomResult/state.svelte"
</script>

<div class="room-info-box">
  {#if $frozenRoom}
    <!-- INFO -->
    <div class="column">
      <!-- ID -->
      <div class="info-item">
        <span class="id">ROOM #{$frozenRoom.index}</span>
      </div>
      <!-- NAME -->
      <div class="info-item">
        <span class="name">{$frozenRoom.name}</span>
      </div>

      <!-- IMAGE -->
      <div class="image-container">
        <img src="/images/room3.jpg" alt={$frozenRoom.name} />
      </div>
      <!-- BALANCE -->
      <div class="info-item">
        <span class="balance">${$frozenRoom.balance}</span>
      </div>
    </div>
    <!-- PROMPT -->
    <div class="column">
      <div class="room-description">{$frozenRoom.roomPrompt}</div>
    </div>
    <!-- STATS -->
    <div class="column">
      <!-- VISITORS -->
      <div class="info-item">
        <span class="visitor-count">VISITS: {$frozenRoom.visitCount}</span>
      </div>
      <!-- PLAYER COUNT -->
      <div class="info-item">
        <span class="kill-count">
          KILLS: {Number($frozenRoom.killCount) || 0}
        </span>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .room-info-box {
    width: calc(50% - 50px);
    height: 100%;
    border: 1px solid white;
    border-left: none;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .image-container {
    width: 100px;
    height: 100px;
    border: 1px solid white;
    margin: 10px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .column {
    width: calc(100% / 3);
    border-right: 1px dashed white;
  }

  .info-item {
    display: flex;
    margin: 10px;
    gap: 10px;

    .id {
      background: var(--color-grey-light);
      padding: 5px;
      color: black;
      font-size: var(--font-size-small);
    }

    .name {
      background: var(--color-alert);
      padding: 5px;
      color: black;
    }

    .balance {
      background: var(--color-value);
      padding: 5px;
      color: black;
    }

    .health {
      background: var(--color-health);
      padding: 5px;
      color: black;
    }
  }

  .header {
    border-bottom: 1px dashed white;
    padding: 5px;
  }

  .room-description {
    margin: 5px;
  }
</style>
