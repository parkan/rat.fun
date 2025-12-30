<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import { getDrawbridge, isSessionReady } from "$lib/modules/drawbridge"
  import { sendSpawn } from "$lib/modules/action-manager/index.svelte"
  import { player } from "$lib/modules/state/stores"
  import { waitForPropertyChangeFrom } from "$lib/modules/state/utils"
  import { spawnState, SPAWN_STATE } from "$lib/components/Spawn/state.svelte"
  import { SmallSpinner } from "$lib/components/Shared"
  import { errorHandler } from "$lib/modules/error-handling"
  import { isUserRejectionError } from "$lib/modules/error-handling/utils"
  import { UI_STRINGS } from "$lib/modules/ui/ui-strings/index.svelte"
  import { publicNetwork } from "$lib/modules/network"
  import { setupWalletNetwork } from "@ratfun/common/mud"
  import { initWalletNetwork } from "$lib/initWalletNetwork"
  import { WALLET_TYPE } from "@ratfun/common/basic-network"
  import { initEntities, isEntitiesInitialized } from "$lib/modules/chain-sync"
  import { addressToId } from "@ratfun/shared-utils"
  import { createLogger } from "$lib/modules/logger"

  const logger = createLogger("[SessionAndSpawnLoading]")

  let error = $state<string | null>(null)
  let isUserRejection = $state(false)
  let status = $state<string>("Setting up Slop Machine")

  async function executeSessionAndSpawn() {
    const name = spawnState.data.playerName
    logger.log("Starting session setup and spawn with name:", name)

    // Defensive check - should never happen due to state machine guarantees
    if (!name) {
      logger.error("No name found in state - this should not happen")
      spawnState.state.transitionTo(SPAWN_STATE.SESSION_AND_SPAWN)
      return
    }

    try {
      /* - - - - - - - - - - - - -
       * Step 1: Set up session
       * - - - - - - - - - - - - - */

      logger.log("Step 1: Setting up slop machine")
      status = "Setting up Slop Machine"

      const drawbridge = getDrawbridge()
      await drawbridge.setupSession()

      logger.log("Session setup complete, waiting for ready state")

      // Wait for session to be ready
      await new Promise<void>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if ($isSessionReady) {
            logger.log("Session is ready")
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          if (!$isSessionReady) {
            reject(new Error("Session setup timed out"))
          }
        }, 10000)
      })

      // Initialize wallet network now that session is ready
      const state = drawbridge.getState()
      if (state.sessionClient && state.userAddress) {
        logger.log("Initializing wallet network")
        const wallet = setupWalletNetwork($publicNetwork, state.sessionClient)
        initWalletNetwork(wallet, state.userAddress, WALLET_TYPE.DRAWBRIDGE)

        // Initialize entities (Scenario C without session)
        if (!isEntitiesInitialized()) {
          const playerId = addressToId(state.userAddress)
          logger.log("Initializing entities for player:", playerId)
          await initEntities({ activePlayerId: playerId })
        }
      }

      /* - - - - - - - - - - - - -
       * Step 2: Spawn
       * - - - - - - - - - - - - - */

      logger.log("Step 2: Spawning")
      status = "Issuing operator pass"

      await sendSpawn(name)
      logger.log("Spawn transaction sent, waiting for player name to update")

      // Wait for player name to be set
      await waitForPropertyChangeFrom(player, "name", undefined, 10000)

      logger.log("Player name updated successfully")
      // Success! Transition to DONE
      spawnState.state.transitionTo(SPAWN_STATE.DONE)
    } catch (err) {
      logger.error("Failed:", err)

      // Check if user rejected the transaction
      if (isUserRejectionError(err)) {
        isUserRejection = true
        error = UI_STRINGS.userRejectedTransaction
        // Log to Sentry but don't show toast (already suppressed by SILENT_TOAST_ERRORS)
        errorHandler(err, "Setup rejected by user")
      } else {
        error = err instanceof Error ? err.message : "Setup failed"
        // Send to Sentry and show user-friendly toast
        errorHandler(err, "Setup failed")
      }

      // Wait a moment to show error, then go back to form
      setTimeout(() => {
        spawnState.state.transitionTo(SPAWN_STATE.SESSION_AND_SPAWN)
      }, 2000)
    }
  }

  onMount(() => {
    logger.log("Component mounted")
    executeSessionAndSpawn()
  })
</script>

<div class="outer-container">
  <div class="inner-container">
    {#if error}
      <div
        class="message"
        class:error={!isUserRejection}
        class:info={isUserRejection}
        in:fade={{ duration: 200 }}
      >
        {error}
      </div>
    {:else}
      <div class="message" in:fade={{ duration: 200 }}>
        {status}
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
      width: var(--spawn-inner-width);
      max-width: 90dvw;

      .message {
        font-size: var(--font-size-large);
        font-family: var(--special-font-stack);
        background: var(--background);
        color: var(--foreground);
        padding: 20px;
        text-align: center;
        margin-top: 20px;

        &.error {
          background: var(--color-bad);
          color: var(--background);
        }

        &.info {
          background: var(--foreground);
          color: var(--background);
        }
      }
    }
  }
</style>
