<script lang="ts">
  import {
    playerRat,
    playerRatLoadOut,
  } from "@svelte/modules/state/base/stores"

  import LoadOutItem from "@svelte/components/Nest/LoadOut/LoadOutItem.svelte"

  export let locked = false
</script>

<div class="load-out" class:locked>
  <div class="title">__ Load out (click item to dequip)</div>
  <div class="content">
    {#if !$playerRatLoadOut || $playerRatLoadOut.length === 0}
      <div>** EMPTY **</div>
    {:else}
      {#each $playerRatLoadOut as item, i}
        <LoadOutItem {item} key={$playerRat.loadOut[i]} />
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  .load-out {
    background: var(--color-grey-light);
    padding: 5px;
    color: var(--black);
    margin-bottom: 10px;

    &.locked {
      pointer-events: none;
    }

    .content {
      margin-top: 5px;
    }
  }
</style>
