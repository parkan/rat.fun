<script lang="ts">
  import { ENVIRONMENT } from "@mud/enums"

  import OperatorBar from "@components/Main/OperatorBar/OperatorBar.svelte"
  import FloorBar from "@components/Main/FloorBar/FloorBar.svelte"
  import LeftContainer from "@components/Main/LeftContainer/LeftContainer.svelte"
  import RightContainer from "@components/Main/RightContainer/RightContainer.svelte"

  export let environment: ENVIRONMENT
</script>

<div class="main">
  <OperatorBar />
  <div class="main-area">
    <LeftContainer {environment} />
    <FloorBar />
    <RightContainer {environment} />
  </div>
</div>

<style lang="scss">
  .main {
    position: fixed;
    top: 10px;
    left: 10px;
    height: calc(100vh - 20px);
    width: calc(100vw - 20px);
    overflow: hidden;
    border: 1px solid white;
  }

  .main-area {
    width: 100%;
    height: calc(100vh - 80px);
    display: flex;
    flex-direction: row;
  }
</style>
