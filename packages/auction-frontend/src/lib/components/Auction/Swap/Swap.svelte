<script lang="ts">
  import { formatUnits } from "viem"
  import { type AuctionParams, CustomQuoter, isPermit2AllowedMaxRequired, balanceOf } from "doppler"
  import { userAddress } from "$lib/modules/drawbridge"
  import { publicNetwork } from "$lib/modules/network"
  import { onMount } from "svelte"
  import { asPublicClient } from "$lib/utils/clientAdapter"
  import { swapState, SWAP_STATE } from "./state.svelte"

  import { SwapForm, CountryCode, Permit2AllowMax, SignPermit2, ExecuteSwap } from "./index"

  let quoter = $state({} as CustomQuoter)
  let isPermit2Req = $state<boolean | null>(null)

  let numeraireBalance = $state<number | undefined>(undefined)
  let tokenBalance = $state<number | undefined>(undefined)

  let {
    auctionParams
  }: {
    auctionParams: AuctionParams
  } = $props()

  // async function updateSpentAmount() {
  //   if (!$userAddress) return
  //   spentAmount = await buyLimitSpentAmount(
  //     asPublicClient($publicNetwork.publicClient),
  //     auctionParams.token.address,
  //     $userAddress
  //   )
  // }

  // Get spent amount and country code when user connects
  // $effect(() => {
  //   if ($userAddress) {
  //     updateSpentAmount()
  //     buyLimitGetCountryCode(
  //       asPublicClient($publicNetwork.publicClient),
  //       auctionParams.token.address,
  //       $userAddress
  //     ).then(result => {
  //       savedCountryCode = result
  //     })
  //   }
  // })

  onMount(async () => {
    if (!$userAddress) return

    // Quoter provides the expected amount user didn't specify (input for exact output, or output for exact input)
    quoter = new CustomQuoter(
      asPublicClient($publicNetwork.publicClient),
      $publicNetwork.publicClient.chain.id,
      auctionParams
    )

    console.log("[Swap] quoter:", quoter)

    isPermit2Req = await isPermit2AllowedMaxRequired(
      asPublicClient($publicNetwork.publicClient),
      $userAddress,
      auctionParams.numeraire.address
    )

    console.log("[Swap] isPermit2Req:", isPermit2Req)

    const unformattedNumeraireBalance = await balanceOf(
      asPublicClient($publicNetwork.publicClient),
      auctionParams.numeraire.address,
      $userAddress
    )
    numeraireBalance = Number(
      formatUnits(unformattedNumeraireBalance, auctionParams.numeraire.decimals)
    )

    const unformattedTokenBalance = await balanceOf(
      asPublicClient($publicNetwork.publicClient),
      auctionParams.token.address,
      $userAddress
    )
    tokenBalance = Number(formatUnits(unformattedTokenBalance, auctionParams.token.decimals))
  })
</script>

<div class="outer-container">
  <div class="swap-form-container">
    <SwapForm {auctionParams} />
  </div>
  <div class="swap-actions-container">
    {#if swapState.state.current === SWAP_STATE.COUNTRY_CODE}
      <CountryCode {auctionParams} />
    {:else if swapState.state.current === SWAP_STATE.PERMIT2_ALLOW_MAX}
      <Permit2AllowMax {auctionParams} />
    {:else if swapState.state.current === SWAP_STATE.SIGN_PERMIT2}
      <SignPermit2 {auctionParams} />
    {:else if swapState.state.current === SWAP_STATE.EXECUTE_SWAP}
      <ExecuteSwap {auctionParams} />
    {/if}
  </div>
</div>

<style lang="scss">
  .outer-container {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
  }
</style>
