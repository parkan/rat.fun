<script lang="ts">
  import type { MergedLogEntry } from "@components/Main/RoomResult/Log/types"
  import { fade } from "svelte/transition"
  import { playSound } from "@modules/sound"

  import DraggableEntity from "@components/Main/Shared/Entities/DraggableEntity.svelte"

  let { logEntry, i }: { logEntry: MergedLogEntry; i: number } = $props()

  const DELAY = 400

  $effect(() => {
    setTimeout(() => playSound("tcm", "selectionScroll"), i * DELAY)
  })
</script>

{#if i > -1}
  <div in:fade|global={{ delay: i * DELAY }} class="log-entry">
    <div class="text">
      <span class="timestamp">{logEntry.timestamp}</span> –
      <span class="event">{logEntry.event}</span>
    </div>
    <div class="outcomes">
      {#if logEntry.healthChange}
        <div
          class="outcome health"
          class:negative={logEntry.healthChange.amount < 0}
        >
          <span class="title">Health</span>
          <span class="value">{logEntry.healthChange.amount}</span>
        </div>
      {/if}
      {#if logEntry.balanceTransfer}
        <div
          class="outcome balance"
          class:negative={logEntry.balanceTransfer.amount < 0}
        >
          <span class="title">Balance</span>
          <span class="value">{logEntry.balanceTransfer.amount}</span>
        </div>
      {/if}
      {#if logEntry.traitChanges}
        {#each logEntry.traitChanges as traitChange}
          <DraggableEntity
            type="trait"
            address={traitChange?.id ?? ""}
            fallback={traitChange}
          />
        {/each}
      {/if}
      {#if logEntry.itemChanges}
        {#each logEntry.itemChanges as itemChange}
          <DraggableEntity
            type="item"
            address={itemChange?.id ?? ""}
            fallback={itemChange}
          />
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style lang="scss">
  .log-entry {
    display: flex;
    height: 3em;
    font-size: 22px;
    .timestamp {
      color: var(--color-grey-light);
    }
  }

  .health {
    background: var(--color-health);
    padding: 10px;
    color: black;
  }

  .balance {
    background: var(--color-value);
    padding: 10px;
    color: black;
  }

  .negative {
    background: red;
  }
</style>
