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
  <!-- <div class="progress">
    {progress.current}
  </div> -->
  <Main>
    <Box></Box>
  </Main>
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

  .progress {
    position: absolute;
    z-index: 10;
  }

  .image-container {
    height: 400px;
    aspect-ratio: 1/1;
    background: grey;
  }

  .rat-cam-header {
    position: absolute;
    top: var(--default-padding);
    left: var(--default-padding);
    width: 100%;
    height: 100%;
  }
</style>
