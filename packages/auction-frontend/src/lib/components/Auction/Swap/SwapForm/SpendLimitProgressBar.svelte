<script lang="ts">
  import { formatUnits } from "viem"
  import { swapState } from "../state.svelte"

  /**
   * Calculate spend limit percentage
   */
  function getSpendPercentage() {
    const spent = swapState.data.spentAmount
    const auctionParams = swapState.data.auctionParams

    if (spent === undefined || !auctionParams) return 0

    const limit = BigInt(auctionParams.spendLimitAmount)
    if (limit === 0n) return 0

    const percentage = (Number(spent) / Number(limit)) * 100
    return Math.min(percentage, 100)
  }

  const spendPercentage = $derived(getSpendPercentage())
</script>

{#if swapState.data.auctionParams}
  <div class="spend-limit-section">
    <div class="spend-limit-header">
      <span class="label">Spend Limit</span>
      <span class="percentage">{spendPercentage.toFixed(1)}%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {spendPercentage}%"></div>
    </div>
    <div class="spend-limit-values">
      <span class="spent">
        {swapState.data.spentAmount !== undefined
          ? formatUnits(swapState.data.spentAmount, swapState.data.auctionParams.numeraire.decimals)
          : "..."}
      </span>
      <span class="limit">
        {formatUnits(
          BigInt(swapState.data.auctionParams.spendLimitAmount),
          swapState.data.auctionParams.numeraire.decimals
        )}
      </span>
    </div>
  </div>
{/if}

<style lang="scss">
  .spend-limit-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: rgba(255, 165, 0, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 165, 0, 0.3);
  }

  .spend-limit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    .percentage {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 165, 0, 1);
    }
  }

  .progress-bar {
    position: relative;
    width: 100%;
    height: 24px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .progress-fill {
    height: 100%;
    background: rgba(0, 255, 0, 0.6);
    transition: width 0.3s ease-out;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
  }

  .spend-limit-values {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;

    .spent {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .limit {
      color: rgba(255, 255, 255, 0.6);
    }
  }
</style>
