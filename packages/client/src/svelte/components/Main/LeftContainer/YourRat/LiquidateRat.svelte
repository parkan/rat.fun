<script lang="ts">
  import { player } from "@modules/state/base/stores"
  import { ratTotalValue } from "@modules/state/base/stores"
  import { liquidateRat } from "@svelte/modules/action"

  const sendLiquidateRat = () => {
    liquidateRat($player.ownedRat)
  }
</script>

<div class="liquidate-rat">
  <div class="data-cell">
    <div class="inner">
      <div class="data-cell-label">Rat Value:</div>
      <div class="data-cell-value">${$ratTotalValue}</div>
    </div>
  </div>
  <div class="action">
    <button on:click={sendLiquidateRat}>Liquidate Rat</button>
  </div>
</div>

<style lang="scss">
  .liquidate-rat {
    height: var(--liquidate-rat-height);
    display: flex;
  }

  .data-cell {
    width: 50%;
    border-right: 1px solid white;
    height: 100%;
    padding: var(--default-padding);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-value);
    color: black;

    .inner {
      display: flex;

      .data-cell-label {
        margin-right: 1ch;
      }
    }
  }

  .action {
    width: 50%;
    height: 100%;
    padding: var(--default-padding);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
