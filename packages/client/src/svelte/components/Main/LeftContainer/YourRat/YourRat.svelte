<script lang="ts">
  import { ratTotalValue } from "@modules/state/base/stores"
  import RatEditor from "@components/Main/LeftContainer/YourRat/RatEditor.svelte"
  import RatCam from "@components/Main/LeftContainer/YourRat/RatCam.svelte"
  import LiquidateRat from "@components/Main/LeftContainer/YourRat/LiquidateRat.svelte"
</script>

<div class="your-rat">
  <RatEditor />
  <RatCam />
  <LiquidateRat />

  {#if $ratTotalValue === 0}
    <div class="dead" />
  {/if}
</div>

<style lang="scss">
  .your-rat {
    flex-direction: column;
    height: 100%;
    position: relative;
  }

  .dead {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    mix-blend-mode: luminosity;
    display: block;
  }
</style>
