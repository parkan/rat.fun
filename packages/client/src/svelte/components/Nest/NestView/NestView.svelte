<script lang="ts">
  import { playerRat } from "@modules/state/base/stores"

  $: console.log("$playerRat", $playerRat)
</script>

<div class="nest-view">NEST VIEW</div>

<style lang="scss">
  .nest-view {
    background: red;
    width: 100%;
    max-width: 600px;
    height: 400px;
    line-height: 400px;
    text-align: center;
  }
</style>
