<script lang="ts">
  import { type AuctionParams, buyLimitSetCountryCode } from "doppler"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { userAddress } from "$lib/modules/drawbridge"
  import { publicNetwork } from "$lib/modules/network"
  import { asPublicClient, asWalletClient } from "$lib/utils/clientAdapter"

  let {
    auctionParams
  }: {
    auctionParams: AuctionParams
  } = $props()

  async function sendCountryCode() {
    if (!$userAddress) throw new Error("wallet not connected")

    const client = await prepareConnectorClientForTransaction()
    // TODO derive country code from ip lookup
    const countryCode = "US"
    const txHash = await buyLimitSetCountryCode(
      asWalletClient(client),
      auctionParams.token.address,
      countryCode
    )
    await asPublicClient($publicNetwork.publicClient).waitForTransactionReceipt({ hash: txHash })
  }
</script>

<BigButton
  text="allow permit2"
  onclick={() => {
    sendCountryCode()
  }}
/>
