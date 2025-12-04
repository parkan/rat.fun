<script lang="ts">
  import { formatUnits, parseUnits, type Hex } from "viem"
  import { swapState } from "../state.svelte"
  import SpendLimitProgressBar from "./SpendLimitProgressBar.svelte"
  import { quoteExactIn, quoteExactOut, availableCurrencies } from "$lib/modules/swap-router"
  import { tokenBalances } from "$lib/modules/balances"

  /**
   * Parse decimal input string, accepting both . and , as decimal separator
   */
  function parseDecimalInput(value: string): number | undefined {
    if (!value || value.trim() === "") return undefined
    // Normalize: replace comma with period
    const normalized = value.replace(",", ".")
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? undefined : parsed
  }

  /**
   * Get balance for a currency address
   */
  function getCurrencyBalance(address: Hex): number | undefined {
    return $tokenBalances[address]?.formatted
  }

  /**
   * Check if a currency has zero balance
   */
  function hasZeroBalance(address: Hex): boolean {
    const balance = getCurrencyBalance(address)
    return balance === undefined || balance === 0
  }

  /**
   * Get the balance of the currently selected currency
   */
  function getSelectedCurrencyBalance(): number | undefined {
    const fromCurrency = swapState.data.fromCurrency
    if (!fromCurrency) return undefined
    return getCurrencyBalance(fromCurrency.address)
  }

  /**
   * Check if the current input amount exceeds the user's balance
   */
  function isAmountExceedsBalance(): boolean {
    const balance = getSelectedCurrencyBalance()
    const amountIn = getAmountIn()
    if (balance === undefined || amountIn === undefined) return false
    return amountIn > balance
  }

  /**
   * Set amount to max balance
   */
  function setMaxAmount() {
    const balance = getSelectedCurrencyBalance()
    if (balance !== undefined && balance > 0) {
      setAmountIn(balance)
    }
  }

  /**
   * Handle currency change from dropdown
   */
  function handleCurrencyChange(event: Event) {
    const select = event.target as HTMLSelectElement
    const selected = availableCurrencies.find(c => c.address === select.value)
    if (selected) {
      swapState.data.setFromCurrency(selected)
      // Clear amounts when currency changes
      swapState.data.setAmountIn(undefined)
      swapState.data.setAmountOut(undefined)
      swapState.data.clearPermit()
    }
  }

  /**
   * Get numeraire amount formatted for display in input field
   */
  function getAmountIn() {
    const amountIn = swapState.data.amountIn
    if (amountIn === 0n) return 0
    const auctionParams = swapState.data.auctionParams
    if (!amountIn || !auctionParams) return undefined
    return Number(formatUnits(amountIn, swapState.data.fromCurrency.decimals))
  }

  /**
   * Set numeraire amount and quote token amount (exact input swap)
   * Clears any existing permits since amounts changed
   */
  function setAmountIn(value: number | undefined) {
    const auctionParams = swapState.data.auctionParams
    if (!auctionParams) return

    // Mark as exact input mode
    swapState.data.setIsExactOut(false)
    // Clear permits when amounts change
    swapState.data.clearPermit()

    const fromCurrency = swapState.data.fromCurrency
    if (value === undefined || value === null || !fromCurrency) {
      swapState.data.setAmountIn(undefined)
      swapState.data.setAmountOut(undefined)
    } else if (value === 0) {
      swapState.data.setAmountIn(0n)
      swapState.data.setAmountOut(undefined)
    } else {
      // Parse display value to bigint with proper decimals
      const amountIn = parseUnits(value.toString(), fromCurrency.decimals)
      swapState.data.setAmountIn(amountIn)
      // Quote the expected output amount
      quoteExactIn(fromCurrency.address, auctionParams, amountIn)
        .then(result => {
          swapState.data.setAmountOut(result.amountOutFinal)
          // TODO eurc for limits
          console.log("eurc", formatUnits(result.amountInUniswap, auctionParams.numeraire.decimals))
        })
        .catch(error => {
          console.error("[SwapForm] Quote failed:", error)
          swapState.data.setAmountOut(undefined)
        })
    }
  }

  /**
   * Get token amount formatted for display in input field
   */
  function getAmountOut() {
    const amountOut = swapState.data.amountOut
    if (amountOut === 0n) return 0
    const auctionParams = swapState.data.auctionParams
    if (!amountOut || !auctionParams) return undefined
    return Number(formatUnits(amountOut, auctionParams.token.decimals))
  }

  /**
   * Set token amount and quote numeraire amount (exact output swap)
   * Clears any existing permits since amounts changed
   */
  function setAmountOut(value: number | undefined) {
    const auctionParams = swapState.data.auctionParams
    if (!auctionParams) return

    // Mark as exact output mode
    swapState.data.setIsExactOut(true)
    // Clear permits when amounts change
    swapState.data.clearPermit()

    const fromCurrency = swapState.data.fromCurrency
    if (value === undefined || value === null || !fromCurrency) {
      swapState.data.setAmountIn(undefined)
      swapState.data.setAmountOut(undefined)
    } else if (value === 0) {
      swapState.data.setAmountIn(undefined)
      swapState.data.setAmountOut(0n)
    } else {
      // Parse display value to bigint with proper decimals
      const amountOut = parseUnits(value.toString(), auctionParams.token.decimals)
      swapState.data.setAmountOut(amountOut)
      // Quote the required input amount
      quoteExactOut(fromCurrency.address, auctionParams, amountOut)
        .then(result => {
          swapState.data.setAmountIn(result.amountInInitial)
          // TODO eurc for limits
          console.log("eurc", formatUnits(result.amountInUniswap, auctionParams.numeraire.decimals))
        })
        .catch(error => {
          console.error("[SwapForm] Quote failed:", error)
          swapState.data.setAmountIn(undefined)
        })
    }
  }

  /**
   * Get in-game rats from token amount
   * Each in-game rat costs 100 $RAT
   * Floored since you can't have fractional rats
   */
  function getInGameRats() {
    const amountOut = swapState.data.amountOut
    const auctionParams = swapState.data.auctionParams
    if (!amountOut || !auctionParams) return undefined
    const ratAmount = Number(formatUnits(amountOut, auctionParams.token.decimals))
    return Math.floor(ratAmount / 100)
  }

  /**
   * Set in-game rats and calculate $RAT amount needed (exact output swap)
   * Each in-game rat costs 100 $RAT
   */
  function setInGameRats(value: number | undefined) {
    if (value === undefined || value === null) {
      setAmountOut(undefined)
    } else {
      // Convert rats to $RAT amount (multiply by 100)
      const ratAmount = value * 100
      setAmountOut(ratAmount)
    }
  }

  /**
   * Handle amount in input change (accepts both . and , as decimal separator)
   */
  function handleAmountInInput(event: Event) {
    const input = event.target as HTMLInputElement
    const value = parseDecimalInput(input.value)
    setAmountIn(value)
  }

  /**
   * Handle amount out input change (accepts both . and , as decimal separator)
   */
  function handleAmountOutInput(event: Event) {
    const input = event.target as HTMLInputElement
    const value = parseDecimalInput(input.value)
    setAmountOut(value)
  }

  /**
   * Handle in-game rats input change
   */
  function handleRatsInput(event: Event) {
    const input = event.target as HTMLInputElement
    const value = parseDecimalInput(input.value)
    setInGameRats(value !== undefined ? Math.floor(value) : undefined)
  }
</script>

<div class="swap-form">
  <!-- Spend limit progress bar -->
  <SpendLimitProgressBar />

  {#if swapState.data.auctionParams}
    <!-- Input fields section -->
    <div class="inputs-section">
      <div class="input-group">
        <label for="currency-select">Pay with:</label>
        <select
          id="currency-select"
          value={swapState.data.fromCurrency.address}
          onchange={handleCurrencyChange}
        >
          {#each availableCurrencies as currency}
            <option
              value={currency.address}
              disabled={hasZeroBalance(currency.address)}
              class:disabled={hasZeroBalance(currency.address)}
            >
              {currency.symbol}{hasZeroBalance(currency.address) ? " (no balance)" : ""}
            </option>
          {/each}
        </select>
      </div>
      <div class="input-group">
        <label for="numeraire-input">{swapState.data.fromCurrency.symbol ?? "Amount"}:</label>
        <input
          id="numeraire-input"
          type="text"
          inputmode="decimal"
          placeholder="0.0"
          class:error={isAmountExceedsBalance()}
          value={getAmountIn() ?? ""}
          oninput={handleAmountInInput}
        />
        <div class="balance-row">
          <span class="balance-row-left">
            <span class="balance-text" class:error={isAmountExceedsBalance()}>
              Balance: {getSelectedCurrencyBalance()?.toLocaleString(undefined, {
                maximumFractionDigits: 6
              }) ?? "..."}
              {swapState.data.fromCurrency.symbol}
            </span>
            {#if isAmountExceedsBalance()}
              <span class="error-text">· Insufficient</span>
            {/if}
          </span>
          {#if getSelectedCurrencyBalance() !== undefined && getSelectedCurrencyBalance()! > 0}
            <button class="max-button" type="button" onclick={setMaxAmount}>MAX</button>
          {/if}
        </div>
      </div>
      <div class="input-group">
        <label for="token-input">$RAT</label>
        <input
          id="token-input"
          type="text"
          inputmode="decimal"
          placeholder="0.0"
          value={getAmountOut() ?? ""}
          oninput={handleAmountOutInput}
        />
      </div>
      <div class="input-group">
        <label for="rats-input">In-game Rats (100 $RAT each)</label>
        <input
          id="rats-input"
          type="text"
          inputmode="numeric"
          placeholder="0"
          value={getInGameRats() ?? ""}
          oninput={handleRatsInput}
        />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .swap-form {
    display: flex;
    flex-flow: column nowrap;
    gap: 20px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 400px;
    margin-bottom: 20px;
    width: 100%;
  }

  .inputs-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }

    select,
    input {
      padding: 12px 16px;
      font-size: 16px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: rgba(255, 255, 255, 0.4);
        background: rgba(0, 0, 0, 0.4);
      }
    }

    select {
      cursor: pointer;

      option {
        background: #1a1a1a;
        color: white;

        &:disabled,
        &.disabled {
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }
      }
    }

    input {
      &::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }

      // Remove spinner arrows
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type="number"] {
        appearance: textfield;
        -moz-appearance: textfield;
      }

      &.error {
        border-color: #ff4444;
        background: rgba(255, 68, 68, 0.1);
      }
    }

    .balance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .balance-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);

      &.error {
        color: #ff4444;
      }
    }

    .balance-row-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .max-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }

    .error-text {
      font-size: 12px;
      color: #ff4444;
    }
  }
</style>
