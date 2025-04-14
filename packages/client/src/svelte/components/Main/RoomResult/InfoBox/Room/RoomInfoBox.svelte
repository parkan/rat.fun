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
      <div class="header">Room</div>
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
      opacity: 0.8;
    }

    .death {
      position: absolute;
      inset: 0;
      z-index: 9;
    }
  }

  .column {
    width: calc(100% / 3);
    border-right: 1px dashed white;

    .header {
      width: 100%;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px dashed white;
    }

    &.info {
      display: grid;
      grid-template-rows: 1fr 20px;
      gap: 12px;
      // padding-bottom: 12px;

      .meta {
        display: flex;
        gap: 12px;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        height: 100%;

        .balance {
          background: var(--color-value);
          color: var(--black);
        }

        .health {
          background: var(--color-death);
          color: var(--white);
        }
      }
    }

    .matrix {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 20px 1fr;
      gap: 10px;
      width: 100%;
      height: 100px;
      text-align: center;
    }

    .big-num {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &:last-child {
      border-right: 1px solid white;
    }
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
