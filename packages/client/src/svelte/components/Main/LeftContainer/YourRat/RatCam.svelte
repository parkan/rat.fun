<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { Tween } from "svelte/motion"
  import Main from "@components/3D/World/Main.svelte"
  import Box from "@components/3D/Box/Box.svelte"

  let progress = new Tween(0, { duration: 2000 })

  onMount(() => {
    progress.set(1)
  })

  onDestroy(() => {
    progress.set(0)
  })
</script>

<div class="rat-cam">
  <div class="square">
    <Main>
      <Box></Box>
    </Main>
  </div>
</div>

<style lang="scss">
  .rat-cam {
    border-bottom: 1px solid white;
    height: var(--rat-cam-height);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .square {
    aspect-ratio: 1 / 1;
    height: 100%;
  }
</style>
