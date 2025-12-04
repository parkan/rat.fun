<script lang="ts">
  import { exchangeFlowState } from "./state.svelte"
  import { BigButton, SmallButton } from "$lib/components/Shared"
  import { addRatTokenToWallet } from "$lib/modules/drawbridge/connector"

  const basescanUrl = exchangeFlowState.data.exchangeTxHash
    ? `https://basescan.org/tx/${exchangeFlowState.data.exchangeTxHash}`
    : null

  function goToRatFun() {
    window.location.href = "https://rat.fun"
  }

  async function handleAddToken() {
    try {
      await addRatTokenToWallet()
    } catch (e) {
      console.error("Failed to add token to wallet:", e)
    }
  }
</script>

<div class="complete">
  <div class="info">
    <p>Exchange complete</p>
    <p>You received {exchangeFlowState.data.exchangeAmount} $RAT tokens</p>
    {#if basescanUrl}
      <a href={basescanUrl} target="_blank" rel="noopener noreferrer" class="tx-link">
        View transaction on Basescan
      </a>
    {/if}
  </div>
  <div class="add-token-button-container">
    <SmallButton text="Add token information to wallet" onclick={handleAddToken} />
  </div>
  <div class="button-container">
    <BigButton text="Go to rat.fun" onclick={goToRatFun} />
  </div>
</div>

<style lang="scss">
  .complete {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;

    .info {
      width: 100%;
      font-size: var(--font-size-normal);
      font-family: var(--typewriter-font-stack);
      color: black;
      background: lightgreen;
      padding: 20px;

      p {
        margin: 5px 0;
      }

      .tx-link {
        display: block;
        margin-top: 10px;
        font-size: var(--font-size-small);
        color: black;
        text-decoration: underline;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .add-token-button-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 40px;
    }

    .button-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 160px;
    }
  }
</style>
