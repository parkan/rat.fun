<script lang="ts">
  import { onMount } from "svelte"
  import gsap from "gsap"
  import { getDrawbridge, drawbridgeError } from "$lib/modules/drawbridge"
  import { isPhone } from "$lib/modules/ui/state.svelte"
  import { BigButton, Mascot } from "$lib/components/Shared"
  import { spawnState, determineNextState } from "$lib/components/Spawn/state.svelte"
  import { buildFlowContext } from "$lib/components/Spawn/flowContext"
  import { errorHandler } from "$lib/modules/error-handling"
  import { publicNetwork } from "$lib/modules/network"
  import { setupWalletNetwork } from "@ratfun/common/mud"
  import { initWalletNetwork } from "$lib/initWalletNetwork"
  import { WALLET_TYPE } from "@ratfun/common/basic-network"
  import { initEntities, isEntitiesInitialized } from "$lib/modules/chain-sync"
  import { addressToId } from "$lib/modules/utils"
  import { connectWalletFormMascotText } from "./connectWalletFormMascotText"
  import {
    NoWalletsModal,
    WalletSelectModal,
    DeepLinkSelectModal,
    generateWalletDeeplinks,
    FARCASTER_DEEPLINK
  } from "@ratfun/shared-ui/WalletModals"

  const WALLET_DEEPLINKS = {
    ...generateWalletDeeplinks("rat.fun"),
    farcaster: FARCASTER_DEEPLINK
  }
  import { createWalletConnection } from "@ratfun/shared-ui/WalletConnection"

  let mascotElement: HTMLDivElement | null = $state(null)
  let buttonElement: HTMLDivElement | null = $state(null)

  const timeline = gsap.timeline()

  const buttonText = "PROVE OPERATOR IDENTITY"

  // Create wallet connection with app-specific callbacks
  const wallet = createWalletConnection({
    getDrawbridge,
    isPhone: $isPhone,
    onSuccess: async () => {
      // Wait briefly for stores to update after wallet connection
      await new Promise(resolve => setTimeout(resolve, 500))

      // Initialize wallet network if session is ready
      // (returning user with existing session in localStorage)
      const drawbridge = getDrawbridge()
      const state = drawbridge.getState()
      if (state.sessionClient && state.userAddress) {
        console.log("[ConnectWalletForm] Session ready, initializing wallet network")
        const walletNetwork = setupWalletNetwork($publicNetwork, state.sessionClient)
        initWalletNetwork(walletNetwork, state.userAddress, WALLET_TYPE.DRAWBRIDGE)

        // Initialize entities if not already done (Scenario C users)
        // This populates externalAddressesConfig needed for allowance check
        if (!isEntitiesInitialized()) {
          const playerId = addressToId(state.userAddress)
          console.log("[ConnectWalletForm] Initializing entities for player:", playerId)
          await initEntities({ activePlayerId: playerId })
        }
      }

      // Determine next state based on current context
      const context = await buildFlowContext()
      const nextState = determineNextState(context)

      console.log("[ConnectWalletForm] Flow context:", context)
      console.log("[ConnectWalletForm] Next state:", nextState)

      spawnState.state.transitionTo(nextState)
    },
    onError: errorHandler
  })

  // Watch for async errors from drawbridge (e.g., from account watcher)
  $effect(() => {
    if ($drawbridgeError) {
      console.error("[ConnectWalletForm] Drawbridge error:", $drawbridgeError)
      errorHandler($drawbridgeError, "Wallet connection error")
    }
  })

  onMount(() => {
    console.log("[ConnectWalletForm] Component mounted")

    wallet.prepareConnectors()

    if (!mascotElement || !buttonElement) {
      return
    }

    gsap.set([mascotElement, buttonElement], { opacity: 0 })

    timeline
      .to(mascotElement, { opacity: 1, duration: 0.4 }, "0")
      .to(buttonElement, { opacity: 1, duration: 0.4 }, "0.2")
  })
</script>

<div class="outer-container">
  <div class="inner-container">
    <div class="mascot-container" bind:this={mascotElement}>
      <Mascot headBobOn={true} text={connectWalletFormMascotText} finishTextOnClick={true} />
    </div>

    <div class="button-container" bind:this={buttonElement}>
      {#if wallet.connecting}
        <BigButton text="Connecting..." disabled={true} onclick={() => {}} />
      {:else}
        <BigButton text={buttonText} onclick={wallet.handleClick} />
      {/if}
    </div>

    <NoWalletsModal bind:show={wallet.showNoWalletsModal} />

    <WalletSelectModal
      bind:show={wallet.showWalletSelect}
      connectors={wallet.availableConnectors}
      connecting={wallet.connecting}
      onSelect={wallet.connectWallet}
    />

    <DeepLinkSelectModal bind:show={wallet.showDeepLinkSelect} deeplinks={WALLET_DEEPLINKS} />
  </div>
</div>

<style lang="scss">
  .outer-container {
    display: flex;
    flex-flow: column nowrap;
    height: var(--game-window-height);
    align-items: center;
    justify-content: center;
    color: var(--background);

    .inner-container {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      width: var(--spawn-inner-width);
      max-width: 90dvw;

      .mascot-container {
        width: var(--spawn-mascot-size);
        height: var(--spawn-mascot-size);
        margin-bottom: var(--spawn-mascot-margin-bottom);
        pointer-events: none;
      }

      .button-container {
        width: 100%;
        height: var(--spawn-button-height);
      }
    }
  }
</style>
