<script lang="ts">
  import { formatUnits, parseUnits } from "viem"
  import { type AuctionParams } from "doppler"

  let spentAmount = $state<bigint | undefined>(undefined)

  let amountIn = $state<bigint | undefined>(undefined)
  let amountOut = $state<bigint | undefined>(undefined)
  let isExactOut = $state(false)

  let {
    auctionParams
  }: {
    auctionParams: AuctionParams
  } = $props()

  function getAmountIn() {
    return !amountIn ? undefined : Number(formatUnits(amountIn, auctionParams.numeraire.decimals))
  }

  function setAmountIn(v: number | undefined) {
    isExactOut = false
    if (v === undefined || v === null) {
      amountIn = undefined
      amountOut = undefined
    } else {
      amountIn = parseUnits(v.toString(), auctionParams.numeraire.decimals)
      quoter.quoteExactInputV4(amountIn, true).then(result => {
        amountOut = result.amountOut
      })
    }

    permit = undefined
    permitSignature = undefined
  }

  function getAmountOut() {
    return !amountOut ? undefined : Number(formatUnits(amountOut, auctionParams.token.decimals))
  }

  function setAmountOut(v: number | undefined) {
    isExactOut = true
    if (v === undefined || v === null) {
      amountIn = undefined
      amountOut = undefined
    } else {
      amountOut = parseUnits(v.toString(), auctionParams.token.decimals)
      quoter.quoteExactOutputV4(amountOut, true).then(result => {
        amountIn = result.amountIn
      })
    }

    permit = undefined
    permitSignature = undefined
  }
</script>

<div class="swap-form">
  <div>
    numeraire balance: {numeraireBalance}
  </div>
  <div>
    token balance: {tokenBalance}
  </div>
  <div>
    spent numeraire: {spentAmount !== undefined
      ? formatUnits(spentAmount, auctionParams.numeraire.decimals)
      : "..."} / {formatUnits(
      BigInt(auctionParams.spendLimitAmount),
      auctionParams.numeraire.decimals
    )}
  </div>

  numeraire:
  <input type="number" bind:value={getAmountIn, setAmountIn} />

  rat:
  <input type="number" bind:value={getAmountOut, setAmountOut} />
</div>
