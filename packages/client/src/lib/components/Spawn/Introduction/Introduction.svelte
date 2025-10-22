<script lang="ts">
  import { UIState } from "$lib/modules/ui/state.svelte"
  import { UI } from "$lib/modules/ui/enums"
  import { Logo } from "$lib/components/Shared"

  let { onComplete }: { onComplete: () => void } = $props()
</script>

<div class="outer-container">
  <Logo entranceOn={$UIState === UI.SPAWNING} {onComplete} />
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
