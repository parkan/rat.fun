<script lang="ts">
  import type { NewTripMessage } from "./types"
  import { goto } from "$app/navigation"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"

  let { message }: { message: NewTripMessage } = $props()

  function handleTripClick() {
    goto(`/${message.tripId}`)
  }
</script>

<button class="new-trip" onclick={handleTripClick}>
  <div class="trip-header">
    <span class="arrow">&gt;&gt;&gt;&gt;</span>
    <span class="creator-name">{message.creatorName.toUpperCase()}</span>
    <span class="action">CREATED TRIP</span>
    <span class="trip-index">#{message.tripIndex}</span>
    {#if message.tripCreationCost > 0}
      <span class="cost">({message.tripCreationCost} {CURRENCY_SYMBOL})</span>
    {/if}
  </div>
  <div class="trip-prompt">"{message.tripPrompt}"</div>
</button>

<style lang="scss">
  .new-trip {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-align: left;
  }

  .trip-header {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    align-items: baseline;
  }

  .arrow {
    color: var(--color-good);
    margin-right: 4px;
  }

  .creator-name {
    color: var(--foreground);
  }

  .action {
    text-transform: uppercase;
    color: var(--color-grey-light);
  }

  .trip-index {
    font-family: var(--mono-font-stack);
    color: var(--foreground);
  }

  .cost {
    color: var(--color-grey-light);
    font-family: var(--mono-font-stack);
  }

  .trip-prompt {
    color: var(--color-grey-light);
    border-right: 1px solid var(--color-grey-dark);
  }
</style>
