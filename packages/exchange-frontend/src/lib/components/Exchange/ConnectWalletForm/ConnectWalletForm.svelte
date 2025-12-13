<script lang="ts">
  import { onMount } from "svelte"
  import gsap from "gsap"
  import { getDrawbridge } from "$lib/modules/drawbridge"
  import { isPhone } from "$lib/modules/ui/state.svelte"
  import BigButton from "$lib/components/Shared/Buttons/BigButton.svelte"
  import {
    WalletSelectModal,
    NoWalletsModal,
    DeepLinkSelectModal,
    generateWalletDeeplinks
  } from "@ratfun/shared-ui/WalletModals"

  const WALLET_DEEPLINKS = generateWalletDeeplinks("swap-fake.rat.fun")
  import { createWalletConnection } from "@ratfun/shared-ui/WalletConnection"

  let buttonElement: HTMLDivElement | null = $state(null)

  const timeline = gsap.timeline()

  // Create wallet connection
  const wallet = createWalletConnection({
    getDrawbridge,
    isPhone: $isPhone,
    onError: (error, message) => console.error(message, error)
  })

  onMount(() => {
    wallet.prepareConnectors()

    if (!buttonElement) {
      return
    }

    // Set initial opacity to 0
    buttonElement.style.opacity = "0"

    // Animate opacity to 1
    if (buttonElement) {
      timeline.to(buttonElement, {
        opacity: 1,
        duration: 0.4
      })
    }
  })
</script>

<div class="outer-container">
  <div class="inner-container">
    <div class="info-box">
      <p>Connect your wallet to swap $FAKERAT for real $RAT</p>
    </div>
    <div class="button-container" bind:this={buttonElement}>
      {#if wallet.connecting}
        <BigButton text="Connecting..." disabled={true} onclick={() => {}} />
      {:else}
        <BigButton text="Connect wallet" onclick={wallet.handleClick} />
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
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    margin: 0;

    .inner-container {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      width: 800px;
      max-width: 90dvw;

      .info-box {
        width: 100%;
        padding: 0;
        margin-bottom: 30px;
        color: white;
        text-align: center;
        font-size: var(--font-size-extra-large);
        font-family: var(--special-font-stack);
        line-height: 1.1em;

        p {
          margin: 0;
          padding: 0;
        }
      }

      .button-container {
        width: 100%;
        height: 200px;
      }
    }
  }
</style>
