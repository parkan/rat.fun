<script lang="ts">
  import { type AuctionParams, permit2AllowMax } from "doppler"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { publicNetwork } from "$lib/modules/network"
  import { asPublicClient, asWalletClient } from "$lib/utils/clientAdapter"

  let {
    auctionParams
  }: {
    auctionParams: AuctionParams
  } = $props()

  async function sendPermit2AllowMax() {
    const client = await prepareConnectorClientForTransaction()
    const { receipt } = await permit2AllowMax(
      asPublicClient($publicNetwork.publicClient),
      asWalletClient(client),
      auctionParams.numeraire.address
    )
    if (receipt.status === "success") {
      // Transition to next state
    }
  }
</script>

<BigButton
  text="allow permit2"
  onclick={() => {
    sendPermit2AllowMax()
  }}
/>
