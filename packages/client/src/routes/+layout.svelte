<script lang="ts">
  import "../app.css"
  import "tippy.js/dist/tippy.css"

  import type { LayoutProps } from './$types';

  import { Modal } from "$lib/components/Main/Modal/state.svelte"

  let { children, data }: LayoutProps = $props()

  $inspect(data.environment)
</script>



<div class="bg">
  <div class="context-main">
    {@render children?.()}
  </div>
</div>

<Modal />

<style lang="scss">
  .context-main {
    width: var(--game-window-width);
    height: var(--game-window-height);
    overflow: hidden;
    position: fixed;
    z-index: var(--z-base);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: var(--background);
  }

  main {
    width: var(--game-window-width);
    height: var(--game-window-height);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bg {
    position: fixed;
    inset: 0;
    z-index: var(--z-background);
    background: var(--background);
    background-image: url("/images/textures/2.jpg");
    background-size: 300px;
  }
</style>