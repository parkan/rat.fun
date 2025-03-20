<script lang="ts">
  import RatEditor from "@components/Main/LeftContainer/YourRat/RatEditor.svelte"
  import RatCam from "@components/Main/LeftContainer/YourRat/RatCam.svelte"
  import LiquidateRat from "@components/Main/LeftContainer/YourRat/LiquidateRat.svelte"
</script>

<div class="your-rat">
  <RatEditor />
  <RatCam />
  <LiquidateRat />
</div>

<style lang="scss">
  .your-rat {
    flex-direction: column;
    height: 100%;
  }
</style>
