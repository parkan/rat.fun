<script lang="ts">
  import { frozenRat } from "@svelte/components/Main/RoomResult/state.svelte"
</script>

<div class="rat-info-box">
  {#if $frozenRat}
    <!-- INFO -->
    <div class="column info">
      <div class="image-container">
        <img src="/images/rat.png" alt={$frozenRat.name} />
      </div>
      <div class="rat-name">**{$frozenRat.name}**</div>
      <div class="rat-balance">${$frozenRat.balance}</div>
      <div class="rat-health">{$frozenRat.health}</div>
    </div>
    <!-- TRAITS -->
    <div class="column traits">traits</div>
    <!-- INVENTORY -->
    <div class="column inventory">inventory</div>
  {/if}
</div>

<style lang="scss">
  .rat-info-box {
    width: 50%;
    height: 100%;
    border: 1px solid white;
    border-right: none;
    overflow: hidden;
    display: flex;
  }

  .image-container {
    width: 100px;
    height: 100px;
    border: 1px solid white;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .column {
    width: calc(100% / 3);
    padding: 10px;
    border-right: 1px dashed white;

    &:last-child {
      border-right: none;
    }
  }
</style>
