<script lang="ts">
  import { type Hex } from "viem"
  import {
    type AuctionParams,
    type Permit2PermitData,
    signPermit2ForUniversalRouter
  } from "doppler"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { publicNetwork } from "$lib/modules/network"
  import { signTypedData } from "viem/actions"
  import { asPublicClient } from "$lib/utils/clientAdapter"

  let permit = $state<Permit2PermitData | undefined>(undefined)
  let permitSignature = $state<Hex | undefined>(undefined)

  let {
    auctionParams,
    amountIn,
    amountOut,
    isExactOut
  }: {
    auctionParams: AuctionParams
    amountIn: bigint
    amountOut: bigint
    isExactOut: boolean
  } = $props()

  async function sendSignPermit2() {
    const client = await prepareConnectorClientForTransaction()
    // TODO ensure signTypedData in a less hacky way
    const extendedClient = (client as any).extend((client: any) => ({
      signTypedData: (args: any) => signTypedData(client, args)
    }))

    const amount = isExactOut ? amountOut : amountIn
    if (amount === undefined) throw new Error("amount is undefined")
    // For exact out give 10% padding to permit amount to account for price variance and imprecise conversion
    // (because permit is always for input currency)
    const amountPadded = isExactOut ? (amount * 110n) / 100n : amount
    const result = await signPermit2ForUniversalRouter(
      asPublicClient($publicNetwork.publicClient),
      extendedClient,
      auctionParams,
      amountPadded,
      {
        isOut: isExactOut
      }
    )
    permit = result.permit
    permitSignature = result.permitSignature
  }
</script>

<BigButton
  disabled={!amountIn}
  text="sign permit"
  onclick={() => {
    sendSignPermit2()
  }}
/>
