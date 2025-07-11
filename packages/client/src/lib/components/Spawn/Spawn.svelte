<script lang="ts">
  import type { SetupWalletNetworkResult } from "$lib/mud/setupWalletNetwork"

  import { onMount } from "svelte"

  import { WALLET_TYPE } from "$lib/mud/enums"
  import { SPAWN_STATE } from "$lib/modules/ui/enums"

  import { publicNetwork } from "$lib/modules/network"
  import { setupWalletNetwork } from "$lib/mud/setupWalletNetwork"
  import { setupBurnerWalletNetwork } from "$lib/mud/setupBurnerWalletNetwork"
  import { initWalletNetwork } from "$lib/initWalletNetwork"
  import { entryKitSession } from "$lib/components/Spawn/EntryKit/stores"

  import { playerERC20Allowance, playerERC20Balance } from "$lib/modules/state/base/stores"

  import Introduction from "$lib/components/Spawn/Introduction/Introduction.svelte"
  import ConnectWalletForm from "$lib/components/Spawn/ConnectWalletForm/ConnectWalletForm.svelte"
  import SpawnForm from "$lib/components/Spawn/SpawnForm/SpawnForm.svelte"
  import TokenForm from "$lib/components/Spawn/TokenForm/TokenForm.svelte"
  import ApprovalForm from "$lib/components/Spawn/ApprovalForm/ApprovalForm.svelte"
  import HeroImage from "$lib/components/Spawn/HeroImage/HeroImage.svelte"

  const { walletType, spawned = () => {} } = $props<{
    walletType: WALLET_TYPE
    spawned: () => void
  }>()

  let currentState = $state<SPAWN_STATE>(SPAWN_STATE.INTRODUCTION)

  const onIntroductionComplete = () => (currentState = SPAWN_STATE.CONNECT_WALLET)

  async function connectBurner() {
    const wallet = setupBurnerWalletNetwork($publicNetwork)
    const isSpawned = initWalletNetwork(
      wallet,
      wallet.walletClient?.account.address,
      WALLET_TYPE.BURNER
    )

    // Check if player is already spawned
    if (isSpawned) {
      // Connected and spawned - finish spawn process
      spawned()
    } else {
      // New user – show introduction
      currentState = SPAWN_STATE.INTRODUCTION
    }
  }

  const onWalletConnectionComplete = () => {
    console.log("Here my wallet type is ", walletType)
    if (walletType === WALLET_TYPE.ENTRYKIT) {
      console.log("entrykitStore", $entryKitSession)

      /* We get the account kit store state
       * If appAccountClient and userAddress are set the user is connected
       * We set up the wallet network using the appAccountClient
       * and set playerAddress to the user address
       */

      console.log("entryKitSession", $entryKitSession)

      if (entrykitStoreState.appAccountClient && entrykitStoreState.userAddress) {
        const wallet = setupWalletNetwork(
          $publicNetwork,
          entrykitStoreState.appAccountClient
        ) as SetupWalletNetworkResult

        const isSpawned = initWalletNetwork(wallet, entrykitStoreState.userAddress, walletType)

        if (isSpawned) {
          // Connected and spawned - finish spawn process
          spawned()
        } else {
          // Connected but not spawned - show spawn form
          currentState = SPAWN_STATE.SPAWN_FORM
        }
      } else {
        // New user – show introduction
        currentState = SPAWN_STATE.INTRODUCTION
      }
    } else {
      // Burna
      currentState = SPAWN_STATE.SPAWN_FORM
    }
  }

  onMount(() => {
    if (walletType === WALLET_TYPE.BURNER) connectBurner()
  })
</script>

<div class="container">
  {#if currentState === SPAWN_STATE.INTRODUCTION}
    <Introduction onComplete={onIntroductionComplete} />
  {:else if currentState === SPAWN_STATE.CONNECT_WALLET}
    <ConnectWalletForm {walletType} onComplete={onWalletConnectionComplete} />
  {:else if currentState === SPAWN_STATE.SPAWN_FORM}
    <SpawnForm
      onComplete={() => {
        if ($playerERC20Balance < 100) {
          currentState = SPAWN_STATE.TOKEN_FORM
        } else {
          if ($playerERC20Allowance < 100) {
            currentState = SPAWN_STATE.APPROVAL_FORM
          } else {
            currentState = SPAWN_STATE.HERO_IMAGE
          }
        }
      }}
    />
  {:else if currentState === SPAWN_STATE.TOKEN_FORM}
    <TokenForm
      onComplete={() => {
        if ($playerERC20Allowance < 100) {
          currentState = SPAWN_STATE.APPROVAL_FORM
        } else {
          currentState = SPAWN_STATE.HERO_IMAGE
        }
      }}
    />
  {:else if currentState === SPAWN_STATE.APPROVAL_FORM}
    <ApprovalForm
      onComplete={() => {
        currentState = SPAWN_STATE.HERO_IMAGE
      }}
    />
  {:else if currentState === SPAWN_STATE.HERO_IMAGE}
    <HeroImage
      onComplete={() => {
        spawned()
      }}
    />
  {/if}
</div>

<style lang="scss">
  .container {
    width: 100vw;
    height: 100vh;
    background: var(--background);
    color: var(--foreground);
    font-family: var(--special-font-stack);
    text-transform: none;
    font-size: var(--font-size-large);
  }
</style>
