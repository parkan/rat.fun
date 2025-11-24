<script lang="ts">
  import { buyLimitSetCountryCode } from "doppler"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { userAddress } from "$lib/modules/drawbridge"
  import { publicNetwork } from "$lib/modules/network"
  import { asPublicClient, asWalletClient } from "$lib/utils/clientAdapter"
  import { swapState, SWAP_STATE } from "../state.svelte"

  /**
   * Get country code from user's IP using Cloudflare trace
   * Falls back to "US" if unable to determine
   */
  async function getCountryCodeFromIP(): Promise<string> {
    try {
      const response = await fetch("https://www.cloudflare.com/cdn-cgi/trace")
      const text = await response.text()
      const countryLine = text.split("\n").find(line => line.startsWith("loc="))
      const countryCode = countryLine?.split("=")[1]?.trim()

      if (countryCode && countryCode.length === 2) {
        console.log("[CountryCode] Detected country from IP:", countryCode)
        return countryCode
      }

      console.warn("[CountryCode] Invalid country code format, using fallback")
      return "US"
    } catch (error) {
      console.error("[CountryCode] Failed to fetch country from IP:", error)
      return "US"
    }
  }

  async function sendCountryCode() {
    if (!$userAddress) throw new Error("wallet not connected")
    const auctionParams = swapState.data.auctionParams
    if (!auctionParams) throw new Error("auction params not initialized")

    // Get country code from IP
    const countryCode = await getCountryCodeFromIP()

    const client = await prepareConnectorClientForTransaction()
    const txHash = await buyLimitSetCountryCode(
      asWalletClient(client),
      auctionParams.token.address,
      countryCode
    )
    await asPublicClient($publicNetwork.publicClient).waitForTransactionReceipt({ hash: txHash })

    // Update state and transition
    swapState.data.setSavedCountryCode(countryCode)

    // Determine next state based on permit2 requirement
    if (swapState.data.isPermit2Req === true) {
      swapState.state.transitionTo(SWAP_STATE.PERMIT2_ALLOW_MAX)
    } else {
      swapState.state.transitionTo(SWAP_STATE.SIGN_AND_SWAP)
    }
  }
</script>

<BigButton
  text="Set country code"
  onclick={() => {
    sendCountryCode()
  }}
/>
