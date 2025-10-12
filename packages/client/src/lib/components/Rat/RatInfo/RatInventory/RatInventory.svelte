<script lang="ts">
  import { getRatInventory } from "$lib/modules/state/utils"

  import InteractiveItem from "$lib/components/Rat/RatInfo/RatInventory/InteractiveItem.svelte"
  import EmptySlot from "$lib/components/Rat/RatInfo/RatInventory/EmptySlot.svelte"

  let { displayRat }: { displayRat: Rat | null } = $props()

  let inventory = $derived(displayRat ? getRatInventory(displayRat) : [])

  const MAX_INVENTORY_SIZE = 6

  // Create array with actual items + empty slots to fill MAX_INVENTORY_SIZE slots
  const inventorySlots: (Item | null)[] = $derived.by(() => {
    const actualItems = inventory ?? []
    const emptySlots = Array(MAX_INVENTORY_SIZE - actualItems.length).fill(null)
    return [...actualItems, ...emptySlots]
  })
</script>

<div class="inventory">
  {#if displayRat}
    <div class="inventory-container">
      <!-- INVENTORY GRID -->
      {#each inventorySlots as item, index}
        {#if item}
          <InteractiveItem {item} {index} />
        {:else}
          <EmptySlot {index} />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .inventory {
    width: 100%;
    border-right: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-right: var(--dashed-border-style);
    overflow-x: hidden;
    overflow-y: scroll;
    background-image: url("/images/texture-2.png");
    background-size: 200px;
    height: 100%;
  }

  .inventory-container {
    display: grid;
    gap: 6px;
    padding: 6px;
    flex-shrink: 0;
    box-sizing: border-box;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    height: 100%;
  }
</style>
