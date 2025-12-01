<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import { page } from "$app/state"
  import { fade } from "svelte/transition"

  import { UIState } from "$lib/modules/ui/state.svelte"
  import { UI } from "$lib/modules/ui/enums"

  import { backgroundMusic } from "$lib/modules/sound/stores"

  import { UI_STRINGS } from "$lib/modules/ui/ui-strings/index.svelte"
  import {
    Introduction,
    ConnectWalletForm,
    Allowance,
    AllowanceLoading,
    Session,
    SessionLoading,
    SessionAndSpawn,
    SessionAndSpawnLoading,
    SpawnComponent,
    SpawnLoading,
    Done,
    Error
  } from "$lib/components/Spawn"
  import { spawnState, SPAWN_STATE, determineNextState } from "$lib/components/Spawn/state.svelte"
  import { buildFlowContext } from "$lib/components/Spawn/flowContext"
  import { Marquee } from "$lib/components/Shared"

  const { spawned = () => {} } = $props<{
    spawned: () => void
  }>()

  /**
   * Determine the initial state based on the flow context.
   * See comment in state.svelte.ts
   * @returns The initial state
   */
  async function determineInitialState(): Promise<SPAWN_STATE> {
    const context = await buildFlowContext()

    console.log("[Spawn] Flow context:", context)

    // Special case: if we're on a trip page without spawn param, skip the flow
    if (page.route.id === "/(main)/(game)/[tripId]" && !page.url.searchParams.has("spawn")) {
      console.log("[Spawn] On trip page without spawn param → EXIT_FLOW")
      return SPAWN_STATE.EXIT_FLOW
    }

    const nextState = determineNextState(context)
    console.log("[Spawn] Initial state:", nextState)

    return nextState
  }

  onMount(async () => {
    console.log("[Spawn] Component mounted")

    // Register the exit flow callback
    spawnState.state.setOnExitFlow(spawned)

    // Reset state machine to INIT
    spawnState.state.reset()

    // Determine initial state and transition
    // Drawbridge is guaranteed to be initialized by Loading component
    const initialState = await determineInitialState()
    console.log("[Spawn] Initial state determined:", initialState)
    spawnState.state.transitionTo(initialState)

    // Start background music after a delay
    // (when already spawned we pass through quickly and music might start unnecessarily)
    await new Promise(resolve => setTimeout(resolve, 500))
    if ($UIState === UI.SPAWNING) {
      backgroundMusic.play({ category: "ratfunMusic", id: "spawn", loop: true })
    }
  })

  onDestroy(() => {
    backgroundMusic.stop()
  })
</script>

<div class="container">
  <div class="marquee-container top" in:fade|global={{ duration: 200, delay: 1000 }}>
    <Marquee speed={5} numberOfCopies={10} direction="left">
      <p class="marquee-text">{UI_STRINGS.topMarqueeText}</p>
    </Marquee>
  </div>

  <div class="marquee-container bottom" in:fade|global={{ duration: 200, delay: 1000 }}>
    <Marquee speed={5} numberOfCopies={10} direction="right">
      <p class="marquee-text">{UI_STRINGS.bottomMarqueeText}</p>
    </Marquee>
  </div>

  <div class="content">
    {#if spawnState.state.current === SPAWN_STATE.CONNECT_WALLET}
      <ConnectWalletForm />
    {:else if spawnState.state.current === SPAWN_STATE.INTRODUCTION}
      <Introduction />
    {:else if spawnState.state.current === SPAWN_STATE.ALLOWANCE}
      <Allowance />
    {:else if spawnState.state.current === SPAWN_STATE.ALLOWANCE__LOADING}
      <AllowanceLoading />
    {:else if spawnState.state.current === SPAWN_STATE.SESSION}
      <Session />
    {:else if spawnState.state.current === SPAWN_STATE.SESSION__LOADING}
      <SessionLoading />
    {:else if spawnState.state.current === SPAWN_STATE.SESSION_AND_SPAWN}
      <SessionAndSpawn />
    {:else if spawnState.state.current === SPAWN_STATE.SESSION_AND_SPAWN__LOADING}
      <SessionAndSpawnLoading />
    {:else if spawnState.state.current === SPAWN_STATE.SPAWN}
      <SpawnComponent />
    {:else if spawnState.state.current === SPAWN_STATE.SPAWN__LOADING}
      <SpawnLoading />
    {:else if spawnState.state.current === SPAWN_STATE.DONE}
      <Done />
    {:else if spawnState.state.current === SPAWN_STATE.ERROR}
      <Error />
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    width: 100dvw;
    height: 100dvh;
    color: white;
    font-family: var(--special-font-stack);
    text-transform: none;
    font-size: var(--font-size-normal);
    position: relative;

    .content {
      position: relative;
      z-index: 1;
    }

    .marquee-container {
      position: absolute;
      left: 0;
      width: 100%;
      height: 40px;
      z-index: 1;
      background: rgba(0, 0, 0, 0.5);
      font-size: var(--font-size-normal);
      font-family: var(--typewriter-font-stack);
      text-transform: uppercase;

      .marquee-text {
        padding: 0;
        margin: 0;
        height: 40px;
        line-height: 40px;
      }

      &.top {
        top: 0;
      }

      &.bottom {
        bottom: 0;
      }
    }
  }
</style>
