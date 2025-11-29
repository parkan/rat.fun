<script lang="ts">
  import { exchangeState, EXCHANGE_STATE } from "$lib/components/Exchange/state.svelte"
  import { fakeRatTokenBalance } from "$lib/modules/erc20Listener/stores"

  // Watch for balance changes - if user receives tokens, transition to exchange
  $effect(() => {
    if ($fakeRatTokenBalance > 0) {
      exchangeState.state.transitionTo(EXCHANGE_STATE.EXCHANGE)
    }
  })
</script>

<div class="no-tokens">
  <div class="notice">No $FAKERAT found</div>
</div>

<style lang="scss">
  .no-tokens {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;

    .notice {
      font-size: var(--font-size-normal);
      font-family: var(--typewriter-font-stack);
      color: black;
      background: orangered;
      padding: 10px 20px;
    }
  }
</style>
