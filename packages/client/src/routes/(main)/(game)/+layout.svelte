<script lang="ts">
  import { CenterBar } from "$lib/components/Shared"
  import RatBox from "$lib/components/Rat/RatBox.svelte"

  let { children } = $props()
</script>

<!-- Grid position 1  -->
<RatBox />
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
    height: var(--game-window-main-height);
    background-image: url("/images/texture-5.png");
    background-size: 200px;
  }
</style>
