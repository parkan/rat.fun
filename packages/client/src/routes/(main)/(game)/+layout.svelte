<script lang="ts">
  import { CenterBar } from "$lib/components/Shared"
  import RatContainer from "$lib/components/Rat/RatContainer.svelte"

  let { children } = $props()

  console.log("### routes/(main)/(game)/+layout.svelte ###")
</script>

<!-- Grid position 1  -->
<RatContainer />
<!-- Grid position 2 -->
<CenterBar />
<!-- Grid position 3 -->
<div class="right-column">
  {@render children?.()}
</div>

<style lang="scss">
  .right-column {
    position: relative;
    overflow-x: hidden;
    height: calc(var(--game-window-height) - 60px);
    background-image: url("/images/texture-5.png");
    background-size: 200px;
  }
</style>
