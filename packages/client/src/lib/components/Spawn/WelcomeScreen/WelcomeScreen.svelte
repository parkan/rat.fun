<script lang="ts">
  import { UIState } from "$lib/modules/ui/state.svelte"
  import { UI } from "$lib/modules/ui/enums"
  import { Logo } from "$lib/components/Shared"
  import { spawnState, SPAWN_STATE } from "$lib/components/Spawn/state.svelte"

  function handleComplete() {
    console.log("[WelcomeScreen] Logo animation complete")
    spawnState.state.transitionTo(SPAWN_STATE.CONNECT_WALLET)
  }
</script>

<div class="outer-container">
  <Logo entranceOn={$UIState === UI.SPAWNING} onComplete={handleComplete} />
</div>

<style lang="scss">
  .outer-container {
    display: flex;
    flex-flow: column nowrap;
    height: var(--game-window-height);
    align-items: center;
    justify-content: center;
    color: white;
  }
</style>
