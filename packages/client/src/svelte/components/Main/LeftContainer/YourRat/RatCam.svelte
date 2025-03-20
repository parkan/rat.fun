<script lang="ts">
  import { onMount } from "svelte"

  onMount(() => {
    console.log("RatCam mounted")
  })
</script>

<div class="rat-cam">
  <div class="rat-cam-header">RAT CAM</div>
  <div class="image-container"></div>
</div>

<style lang="scss">
  .rat-cam {
    border-bottom: 1px solid white;
    height: var(--rat-cam-height);
    padding: var(--default-padding);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .image-container {
    height: 70%;
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
