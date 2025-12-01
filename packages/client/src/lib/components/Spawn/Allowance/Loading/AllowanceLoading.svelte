<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import { get } from "svelte/store"
  import { spawnState, SPAWN_STATE } from "$lib/components/Spawn/state.svelte"
  import { SmallSpinner } from "$lib/components/Shared"
  import { errorHandler } from "$lib/modules/error-handling"
  import { approveMax } from "$lib/modules/on-chain-transactions"
  import { externalAddressesConfig } from "$lib/modules/state/stores"
  import { isSessionReady, sessionClient } from "$lib/modules/drawbridge"
  import { walletNetwork, walletType } from "$lib/modules/network"
  import { WALLET_TYPE } from "$lib/mud/enums"
  import { initWalletNetwork } from "$lib/initWalletNetwork"
  import { setupWalletNetwork } from "$lib/mud/setupWalletNetwork"
  import { publicNetwork } from "$lib/modules/network"
  import { setupBurnerWalletNetwork } from "$lib/mud/setupBurnerWalletNetwork"

  let error = $state<string | null>(null)

  function checkIsSpawned(): boolean {
    const currentWalletType = get(walletType)

    if (currentWalletType === WALLET_TYPE.BURNER) {
      const wallet = setupBurnerWalletNetwork(get(publicNetwork))
      if (wallet.walletClient?.account.address) {
        return initWalletNetwork(wallet, wallet.walletClient.account.address, WALLET_TYPE.BURNER)
      }
      return false
    } else {
      const client = get(sessionClient)
      if (client) {
        const wallet = setupWalletNetwork(get(publicNetwork), client)
        return initWalletNetwork(wallet, client.userAddress, currentWalletType)
      }
      return false
    }
  }

  async function executeApproval() {
    console.log("[AllowanceLoading] Starting max allowance approval")

    try {
      const addresses = get(externalAddressesConfig)
      if (!addresses?.gamePoolAddress) {
        throw new Error("Game pool address not configured")
      }

      await approveMax(addresses.gamePoolAddress)
      console.log("[AllowanceLoading] Approval transaction complete")

      // Determine next state based on current conditions
      const currentWalletType = get(walletType)
      const sessionReady = currentWalletType === WALLET_TYPE.BURNER ? true : get(isSessionReady)
      const isSpawned = checkIsSpawned()

      console.log("[AllowanceLoading] Post-approval status:", { sessionReady, isSpawned })

      if (isSpawned) {
        // Already spawned, exit the flow
        console.log("[AllowanceLoading] Already spawned → EXIT_FLOW")
        spawnState.state.transitionTo(SPAWN_STATE.EXIT_FLOW)
      } else if (sessionReady) {
        // Session ready, go to spawn
        console.log("[AllowanceLoading] Session ready → SPAWN")
        spawnState.state.transitionTo(SPAWN_STATE.SPAWN)
      } else {
        // Need session setup and spawn
        console.log("[AllowanceLoading] Need session and spawn → SESSION_AND_SPAWN")
        spawnState.state.transitionTo(SPAWN_STATE.SESSION_AND_SPAWN)
      }
    } catch (err) {
      console.error("[AllowanceLoading] Approval failed:", err)
      error = err instanceof Error ? err.message : "Approval failed"

      // Send to Sentry and show user-friendly toast
      errorHandler(err, "Approval failed")

      // Wait a moment to show error, then go back to allowance screen
      setTimeout(() => {
        spawnState.state.transitionTo(SPAWN_STATE.ALLOWANCE)
      }, 2000)
    }
  }

  onMount(() => {
    console.log("[AllowanceLoading] Component mounted")
    executeApproval()
  })
</script>

<div class="outer-container">
  <div class="inner-container">
    {#if error}
      <div class="message error" in:fade={{ duration: 200 }}>
        {error}
      </div>
    {:else}
      <div class="message" in:fade={{ duration: 200 }}>
        Setting allowance
        <SmallSpinner soundOn />
      </div>
    {/if}
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
      width: 500px;
      max-width: 90dvw;

      .message {
        font-size: var(--font-size-large);
        font-family: var(--special-font-stack);
        background: var(--background);
        color: var(--foreground);
        padding: 20px;
        text-align: center;

        &.error {
          background: orangered;
          color: var(--background);
        }
      }
    }
  }
</style>
