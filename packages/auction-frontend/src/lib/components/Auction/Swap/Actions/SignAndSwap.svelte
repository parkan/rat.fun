<script lang="ts">
  import { signPermit2ForUniversalRouter, swapExactSingle } from "doppler"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { userAddress } from "$lib/modules/drawbridge"
  import { publicNetwork } from "$lib/modules/network"
  import { signTypedData } from "viem/actions"
  import { asPublicClient, asWalletClient } from "$lib/utils/clientAdapter"
  import { swapState, SWAP_STATE } from "../state.svelte"

  let isProcessing = $state(false)

  /**
   * Sign permit2 and execute swap in one flow
   * This is a two-step process:
   * 1. Sign permit (offline, no gas)
   * 2. Execute swap (on-chain transaction)
   */
  async function signAndSwap() {
    if (isProcessing) return
    isProcessing = true

    try {
      if (!$userAddress) throw new Error("wallet not connected")

      const auctionParams = swapState.data.auctionParams
      const amountIn = swapState.data.amountIn
      const amountOut = swapState.data.amountOut
      const isExactOut = swapState.data.isExactOut

      if (!auctionParams) throw new Error("auction params not initialized")

      const amount = isExactOut ? amountOut : amountIn
      if (amount === undefined) throw new Error("amount is undefined")

      console.log("[SignAndSwap] Starting sign and swap flow")

      // * * * * * * * * * * * * * * * * *
      // * * * * * * * * * * * * * * * * *
      // Step 1: Sign permit (offline)
      // * * * * * * * * * * * * * * * * *
      // * * * * * * * * * * * * * * * * *

      console.log("[SignAndSwap] Step 1: Signing permit...")
      const client = await prepareConnectorClientForTransaction()

      // TODO ensure signTypedData in a less hacky way
      const extendedClient = (client as any).extend((client: any) => ({
        signTypedData: (args: any) => signTypedData(client, args)
      }))

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

      // Update swapState with permit data
      swapState.data.setPermit(result.permit)
      swapState.data.setPermitSignature(result.permitSignature)

      console.log("[SignAndSwap] Permit signed successfully")

      // * * * * * * * * * * * * * * * * *
      // * * * * * * * * * * * * * * * * *
      // Step 2: Execute swap (on-chain)
      // * * * * * * * * * * * * * * * * *
      // * * * * * * * * * * * * * * * * *

      console.log("[SignAndSwap] Step 2: Executing swap...")
      const swapResult = await swapExactSingle(
        asPublicClient($publicNetwork.publicClient),
        asWalletClient(client),
        auctionParams,
        amount,
        {
          isOut: isExactOut,
          permit: result.permit,
          permitSignature: result.permitSignature
        }
      )
      console.log("[SignAndSwap] Swap executed successfully:", swapResult)

      // Store receipt in state
      swapState.data.setSwapReceipt(swapResult)

      // Transition to swap complete state
      swapState.state.transitionTo(SWAP_STATE.SWAP_COMPLETE)
    } catch (error) {
      console.error("[SignAndSwap] Error during sign and swap:", error)
      throw error
    } finally {
      isProcessing = false
    }
  }
</script>

<BigButton
  disabled={!swapState.data.amountIn || isProcessing}
  text={isProcessing ? "Processing..." : "Swap"}
  onclick={() => {
    signAndSwap()
  }}
/>
