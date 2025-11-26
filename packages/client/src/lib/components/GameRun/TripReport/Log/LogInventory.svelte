<script lang="ts">
  import { onMount } from "svelte"
  import { gsap } from "gsap"
  import { frozenRat } from "$lib/components/GameRun/state.svelte"
  import { items } from "$lib/modules/state/stores"
  import type { TempItem } from "$lib/components/GameRun/types"

  let {
    delay = 0,
    onTimeline
  }: {
    delay?: number
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>) => void
  } = $props()

  // Timeline
  const timeline = gsap.timeline({ delay })

  // Get inventory items from frozen rat
  let inventoryItems = $derived(frozenRat?.inventory ?? [])
  let hasItems = $derived(inventoryItems.length > 0)

  // Helper to get item name - handles both string (item ID) and TempItem types
  function getItemName(item: string | TempItem): string {
    if (typeof item === "string") {
      // It's an item ID, look up name from items store
      const itemData = $items[item]
      return itemData?.name ?? "Unknown"
    }
    return item.name
  }

  onMount(() => {
    // Only create animation if onTimeline is provided
    // Otherwise, parent will handle the animation manually
    if (onTimeline) {
      timeline.set(".inventory-content", {
        opacity: 0
      })

      timeline.to(".inventory-content", {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      })

      onTimeline(timeline)
    }
  })
</script>

<div class="log-inventory">
  <div class="inventory-content">
    <span class="label">Rat enters with:</span>
    {#if hasItems}
      <span class="items">
        {#each inventoryItems as item, i}
          <span class="item">
            {getItemName(item)}{#if i < inventoryItems.length - 1},
            {/if}
          </span>
        {/each}
      </span>
    {:else}
      <span class="empty">no PsychoObjects</span>
    {/if}
  </div>
</div>

<style lang="scss">
  .log-inventory {
    display: flex;
    margin-bottom: 0.5em;
    line-height: 1.2em;
    font-size: var(--font-size-normal);

    .inventory-content {
      display: inline-block;
      background: var(--background-semi-transparent);
      color: var(--foreground);
      padding: 10px;
      max-width: 80%;
      font-family: var(--typewriter-font-stack);

      .label {
        margin-right: 0.5em;
      }

      .item {
        color: var(--color-item);
      }

      .empty {
        opacity: 0.7;
      }
    }
  }
</style>
