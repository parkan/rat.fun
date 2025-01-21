<script lang="ts">
  import { playerRatTraits } from "@modules/state/base/stores"
  import TraitItem from "./TraitItem.svelte"
</script>

<div class="traits">
  <strong>Traits:</strong>
  {#if $playerRatTraits}
    {#each $playerRatTraits as trait}
      <TraitItem {trait} />
    {/each}
  {/if}
</div>

<style lang="scss">
  .traits {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    padding: 10px;
  }
</style>
