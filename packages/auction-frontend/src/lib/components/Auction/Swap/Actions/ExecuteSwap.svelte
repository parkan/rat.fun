<script lang="ts">
  import { type Hex } from "viem"
  import { type AuctionParams, type Permit2PermitData, swapExactSingle } from "doppler"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { userAddress } from "$lib/modules/drawbridge"
  import { publicNetwork } from "$lib/modules/network"
  import { asPublicClient, asWalletClient } from "$lib/utils/clientAdapter"

  let {
    auctionParams,
    amountIn,
    amountOut,
    isExactOut,
    permit,
    permitSignature
  }: {
    auctionParams: AuctionParams
    amountIn: bigint
    amountOut: bigint
    isExactOut: boolean
    permit: Permit2PermitData | undefined
    permitSignature: Hex | undefined
  } = $props()

  async function sendSwap() {
    if (!$userAddress) throw new Error("wallet not connected")

    const amount = isExactOut ? amountOut : amountIn
    if (amount === undefined) throw new Error("amount is undefined")

    const client = await prepareConnectorClientForTransaction()
    const swapResult = await swapExactSingle(
      asPublicClient($publicNetwork.publicClient),
      asWalletClient(client),
      auctionParams,
      amount,
      {
        isOut: isExactOut,
        permit,
        permitSignature
      }
    )
    console.log("swapResult:", swapResult)
  }
</script>

<BigButton
  text="swap"
  onclick={() => {
    sendSwap()
  }}
/>
