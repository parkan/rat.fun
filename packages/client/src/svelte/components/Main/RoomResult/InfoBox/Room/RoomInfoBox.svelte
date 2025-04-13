<script lang="ts">
  import { frozenRoom } from "@svelte/components/Main/RoomResult/state.svelte"
  import { tippy } from "svelte-tippy"
</script>

<div class="info-box">
  <!-- INFO -->
  {#if $frozenRoom}
    <div class="column info">
      <div class="image-container">
        <img
          use:tippy={{ content: $frozenRoom.name, placement: "bottom" }}
          src="/images/room3.jpg"
          alt={$frozenRoom.name}
        />
      </div>
      <div class="meta">
        <div class="balance">${$frozenRoom.balance}</div>
      </div>
    </div>
    <!-- PROMPT -->
    <div class="column">
      <div class="header">Room</div>
      <div class="room-description">{$frozenRoom.roomPrompt}</div>
    </div>
    <!-- STATS -->
    <div class="column stats">
      <div class="stat balance">
        <div class="header">Stats</div>
        <div class="matrix">
          <div class="item">Killed</div>
          <div class="item">Visits</div>
          <div class="item big-num">
            {((Number($frozenRoom.killCount) || 0) /
              (Number($frozenRoom.visitCount) || 1)) *
              100}%
          </div>
          <div class="item big-num">
            {$frozenRoom.visitCount}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .info-box {
    width: 50%;
    height: 100%;
    border: 1px solid white;
    border-right: none;
    overflow: hidden;
    display: flex;
  }

  .image-container {
    gap: 12px;
    width: 100%;
    min-height: 140px;
    outline: 1px dashed white;
    background: white;
    position: relative;

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
    padding: 10px;
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
</style>
