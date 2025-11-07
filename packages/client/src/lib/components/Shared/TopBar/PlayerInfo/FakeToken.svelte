<script lang="ts">
  import { onMount } from "svelte"
  import {
    playerFakeTokenAllowance,
    playerFakeTokenBalance
  } from "$lib/modules/erc20Listener/stores"
  import { SmallButton } from "$lib/components/Shared"
  import { sendApproveFakeToken } from "$lib/modules/action-manager/actions/sendApproveFakeToken"
  import { sendExchangeFakeToken } from "$lib/modules/action-manager/actions/sendExchangeFakeToken"
  import { busy } from "$lib/modules/action-manager/index.svelte"
  import {
    refetchFakeTokenAllowance,
    refetchFakeTokenBalance
  } from "$lib/modules/erc20Listener/fakeToken"
  import { publicNetwork } from "$lib/modules/network"

  let isMainnet = $state<boolean | null>(null)

  onMount(() => {
    isMainnet = $publicNetwork.publicClient.chain.id === 8453
    if (isMainnet) {
      refetchFakeTokenAllowance()
      refetchFakeTokenBalance()
    }
  })
</script>

<div>
  {#if $playerFakeTokenAllowance !== null && $playerFakeTokenBalance !== null && $playerFakeTokenBalance > 0}
    {#if $playerFakeTokenAllowance < $playerFakeTokenBalance}
      <SmallButton
        disabled={busy.ApproveFakeToken.current !== 0}
        tippyText="Approve FakeSlopamine for exchange"
        onclick={async () => {
          await sendApproveFakeToken()
        }}
        text="Approve FakeSlopamine for exchange"
      ></SmallButton>
    {:else}
      <SmallButton
        disabled={busy.ExchangeFakeToken.current !== 0}
        tippyText="Exchange FakeSlopamine"
        onclick={async () => {
          // TODO exchange the entire fake balance once the real exchange contract is ready
          // await sendExchangeFakeToken($playerFakeTokenBalance)
          await sendExchangeFakeToken(1)
        }}
        text="Exchange FakeSlopamine"
      ></SmallButton>
    {/if}
  {/if}
</div>

<style lang="scss">
</style>
