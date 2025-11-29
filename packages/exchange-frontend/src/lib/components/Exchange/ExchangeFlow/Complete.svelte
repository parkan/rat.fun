<script lang="ts">
  import { exchangeFlowState } from "./state.svelte"

  const basescanUrl = exchangeFlowState.data.exchangeTxHash
    ? `https://basescan.org/tx/${exchangeFlowState.data.exchangeTxHash}`
    : null
</script>

<div class="complete">
  <div class="message">
    <p>Exchange complete!</p>
    <p>You received {exchangeFlowState.data.exchangeAmount} $RAT tokens</p>
  </div>

  {#if basescanUrl}
    <a href={basescanUrl} target="_blank" rel="noopener noreferrer" class="tx-link">
      View transaction on Basescan
    </a>
  {/if}

  <a href="https://rat.fun" class="game-link">Go to rat.fun</a>
</div>

<style lang="scss">
  .complete {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .message {
      font-size: var(--font-size-normal);
      font-family: var(--typewriter-font-stack);
      color: black;
      background: lightgreen;
      padding: 20px;

      p {
        margin: 5px 0;
      }
    }

    .tx-link,
    .game-link {
      font-size: var(--font-size-small);
      font-family: var(--typewriter-font-stack);
      color: var(--white);
      text-decoration: underline;

      &:hover {
        opacity: 0.8;
      }
    }

    .game-link {
      background: orangered;
      color: black;
      padding: 10px 20px;
      text-decoration: none;
      font-weight: bold;

      &:hover {
        opacity: 0.9;
      }
    }
  }
</style>
