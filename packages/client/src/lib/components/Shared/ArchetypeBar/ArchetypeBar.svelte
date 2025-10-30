<script lang="ts">
  import type { Trip as SanityTrip } from "@sanity-types"
  import { HEALTH_SYMBOL } from "$lib/modules/ui/constants"

  let { content }: { content: SanityTrip } = $props()

  let height = $state(112)

  let itemAdd = $state(content?.archetypeItemAdd ?? 0)
  let itemRemove = $state(content?.archetypeItemRemove ?? 0)
  let balanceAdd = $state(content?.archetypeBalanceAdd ?? 0)
  let balanceRemove = $state(content?.archetypeBalanceRemove ?? 0)

  // Sum explicit typed fields to avoid dynamic string indexing on `content`
  let total = $derived(itemAdd + itemRemove + balanceAdd + balanceRemove)
</script>

<div class="archetype-bar" style:height="{height}px">
  {#if total === 0}
    <span> ??? </span>
  {/if}
  {#if itemAdd > 0}
    <div class="item-add" style:height="{(itemAdd / total) * height}px">
      <span> +I </span>
    </div>
  {/if}
  {#if itemRemove > 0}
    <div class="item-remove" style:height="{(itemRemove / total) * height}px">
      <span> -I </span>
    </div>
  {/if}
  {#if balanceAdd > 0}
    <div class="balance-add" style:height="{(balanceAdd / total) * height}px">
      <span class="">
        +{HEALTH_SYMBOL}
      </span>
    </div>
  {/if}
  {#if balanceRemove > 0}
    <div class="balance-remove" style:height="{(balanceRemove / total) * height}px">
      <span>
        -{HEALTH_SYMBOL}
      </span>
    </div>
  {/if}
</div>

<style lang="scss">
  .archetype-bar {
    width: 100%;
    position: relative;
    border-radius: 4px;
    opacity: 0.8;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;

    .item-add {
      display: flex;
      flex-flow: column nowrap;
      justify-content: center;
      align-items: center;
      width: 100%;
      // position: absolute;
      background: var(--color-item-add);
    }
    .item-remove {
      display: flex;
      flex-flow: column nowrap;
      justify-content: center;
      align-items: center;
      width: 100%;
      // position: absolute;
      background: var(--color-item-remove);
    }
    .balance-add {
      display: flex;
      flex-flow: column nowrap;
      justify-content: center;
      align-items: center;
      width: 100%;
      // position: absolute;
      background: var(--color-balance-add);
    }
    .balance-remove {
      display: flex;
      flex-flow: column nowrap;
      justify-content: center;
      align-items: center;
      width: 100%;
      // position: absolute;
      background: var(--color-balance-remove);
    }
  }
</style>
