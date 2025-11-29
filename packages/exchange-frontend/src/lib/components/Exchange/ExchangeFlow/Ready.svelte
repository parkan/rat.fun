<script lang="ts">
  import { exchangeFlowState, EXCHANGE_FLOW_STATE } from "./state.svelte"
  import {
    approveFakeTokenForExchange,
    exchangeFakeToken
  } from "$lib/modules/on-chain-transactions/fakeToken"
  import { refetchBalances } from "$lib/modules/erc20Listener"
  import { BigButton } from "$lib/components/Shared"

  let isProcessing = $state(false)

  async function handleExchange() {
    if (isProcessing) return
    isProcessing = true

    const amount = exchangeFlowState.data.exchangeAmount

    try {
      // Step 1: Approve
      exchangeFlowState.state.transitionTo(EXCHANGE_FLOW_STATE.APPROVING)
      const approveResult = await approveFakeTokenForExchange(amount)

      if (!approveResult) {
        exchangeFlowState.data.setErrorMessage("Approval transaction failed or was rejected")
        exchangeFlowState.state.transitionTo(EXCHANGE_FLOW_STATE.ERROR)
        return
      }

      exchangeFlowState.data.setApproveTxHash(approveResult.transactionHash)

      // Step 2: Exchange
      exchangeFlowState.state.transitionTo(EXCHANGE_FLOW_STATE.EXCHANGING)
      const exchangeResult = await exchangeFakeToken(amount)

      if (!exchangeResult) {
        exchangeFlowState.data.setErrorMessage("Exchange transaction failed or was rejected")
        exchangeFlowState.state.transitionTo(EXCHANGE_FLOW_STATE.ERROR)
        return
      }

      exchangeFlowState.data.setExchangeTxHash(exchangeResult.transactionHash)

      // Refetch balances and complete
      await refetchBalances()
      exchangeFlowState.state.transitionTo(EXCHANGE_FLOW_STATE.COMPLETE)
    } catch (error) {
      console.error("[ExchangeFlow] Error:", error)
      exchangeFlowState.data.setErrorMessage(
        error instanceof Error ? error.message : "Unknown error"
      )
      exchangeFlowState.state.transitionTo(EXCHANGE_FLOW_STATE.ERROR)
    } finally {
      isProcessing = false
    }
  }
</script>

<div class="ready">
  <div class="info">
    <p>You have {exchangeFlowState.data.exchangeAmount} $FAKERAT tokens</p>
    <p>Exchange them for {exchangeFlowState.data.exchangeAmount} $RAT tokens</p>
  </div>
  <div class="button-container">
    <BigButton
      text="Exchange all tokens"
      disabled={isProcessing || exchangeFlowState.data.exchangeAmount === 0}
      onclick={handleExchange}
    />
  </div>
</div>

<style lang="scss">
  .ready {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .info {
      font-size: var(--font-size-normal);
      font-family: var(--typewriter-font-stack);
      color: black;
      background: var(--white);
      padding: 20px;

      p {
        margin: 5px 0;
      }
    }

    .button-container {
      width: 90%;
      max-width: 400px;
    }
  }
</style>
