<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { Tween } from "svelte/motion"
  import { getModalState } from "@components/Main/Modal/state.svelte"
  import Main from "@components/3D/World/Main.svelte"
  import Box from "@components/3D/Box/Box.svelte"
  import PetRat from "@components/3D/PetRat/PetRat.svelte"
  import ModalTarget from "../../Modal/ModalTarget.svelte"

  let { modal } = getModalState()
  let progress = new Tween(0, { duration: 2000 })
  let showPettable = $state(false)

  onMount(() => {
    progress.set(1)
  })

  onDestroy(() => {
    progress.set(0)
  })
</script>

<div
  class="rat-cam"
  onclick={() => {
    showPettable = !showPettable
  }}
>
  <div class="overlay">
    <img src="/images/cutout-test-3.png" alt="cutout" />
  </div>
  <div class="square">
    <Main>
      <Box></Box>
    </Main>
  </div>
</div>

{#snippet bigCam()}
  <div class="big-rat-cam">
    <Main>
      <PetRat></PetRat>
    </Main>
    <button
      class="close"
      onclick={() => {
        console.log("showPettable", showPettable)
        modal.close()
      }}>X</button
    >
  </div>
{/snippet}

{#if showPettable}
  <ModalTarget
    fullscreen={true}
    onclose={() => (showPettable = false)}
    content={bigCam}
  ></ModalTarget>
{/if}

<style lang="scss">
  .rat-cam {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: flex-end;
    position: relative;
    aspect-ratio: 1;
    padding: 5px;
  }

  .square {
    width: 200px;
    height: 200px;
    // aspect-ratio: 1 / 1;
    // height: 100%;
  }

  .big-rat-cam {
    width: calc(var(--game-window-width) - 20px);
    height: var(--game-window-height);
    position: relative;

    .close {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 99;
      width: 20px;
      height: 20px;
      background: red;
    }
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1;
    aspect-ratio: 1 / 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
</style>
