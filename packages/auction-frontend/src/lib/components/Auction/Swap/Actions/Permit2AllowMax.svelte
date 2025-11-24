<script lang="ts">
  import { permit2AllowMax } from "doppler"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { publicNetwork } from "$lib/modules/network"
  import { asPublicClient, asWalletClient } from "$lib/utils/clientAdapter"
  import { swapState, SWAP_STATE } from "../state.svelte"

  async function sendPermit2AllowMax() {
    const auctionParams = swapState.data.auctionParams
    if (!auctionParams) throw new Error("auction params not initialized")

    const client = await prepareConnectorClientForTransaction()
    const { receipt } = await permit2AllowMax(
      asPublicClient($publicNetwork.publicClient),
      asWalletClient(client),
      auctionParams.numeraire.address
    )
    if (receipt.status === "success") {
      // Update state and transition to next state
      swapState.data.setIsPermit2Req(false)
      swapState.state.transitionTo(SWAP_STATE.SIGN_AND_SWAP)
    }
  }
</script>

<BigButton
  text="Allow Permit2"
  onclick={() => {
    sendPermit2AllowMax()
  }}
/>
