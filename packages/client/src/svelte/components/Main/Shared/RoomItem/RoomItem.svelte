<script lang="ts">
  import { getUIState } from "@modules/ui/state.svelte"

  let { roomId, room, yours } = $props()

  let { rooms, enums } = getUIState()
</script>

<button
  class="room-listing-item"
  disabled={room.balance <= 0}
  class:disabled={room.balance <= 0}
  onclick={() =>
    rooms.preview(roomId, yours ? enums.PANE.LEFT : enums.PANE.RIGHT)}
>
  <!-- IMAGE -->
  <div class="room-image">
    <img src="/images/room.jpg" alt={room.name} />
  </div>
  <!-- INFO -->
  <div class="room-info">
    <div class="room-name">**{room.name}**</div>
    <div class="room-visitor-count">Visitors: {room.visitCount}</div>
    <div class="room-balance">Balance: ${room.balance}</div>
    <div class="room-player-count">
      Kill rate: {((Number(room.killCount) || 0) /
        (Number(room.visitCount) || 1)) *
        100}%
    </div>
  </div>
</button>

<style lang="scss">
  .room-listing-item {
    display: flex;
    align-items: center;
    background: transparent;
    outline: none;
    border: none;
    border-bottom: 1px solid white;
    padding-inline: 20px;
    cursor: pointer;
    height: 160px;
    width: 100%;
    color: white;
    text-align: left;

    &.disabled {
      opacity: 0.5;
    }

    &:hover {
      background-color: #222;
    }
  }

  .room-image {
    height: 100px;
    aspect-ratio: 1/1;
    background-color: rgb(36, 36, 36);
    margin-right: 20px;
    border: 1px solid white;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .room-balance {
    background: var(--color-value);
    color: black;
    padding: 5px;
  }
</style>
