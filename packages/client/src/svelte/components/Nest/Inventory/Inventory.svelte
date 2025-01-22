<script lang="ts">
  import { player, playerInventory } from "@svelte/modules/state/base/stores"
  import InventoryItem from "@components/Nest/Inventory/InventoryItem.svelte"
</script>

{#if $player}
  <div class="inventory">
    <div class="title">__ NEST Inventory (click item to equip)</div>
    <div class="content">
      {#if !$playerInventory || $playerInventory.length === 0}
        <div>** EMPTY **</div>
      {:else}
        {#each $playerInventory as item, i}
          <InventoryItem {item} key={$player.inventory[i]} />
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style lang="scss">
  .inventory {
    background: var(--color-grey-light);
    padding: 5px;
    color: var(--black);

    .content {
      margin-top: 5px;
    }
  }
</style>
