<script lang="ts">
  import { BackButton } from "$lib/components/Shared"

  let { src, alt = "", onClose = () => {} } = $props()

  let imageElement = $state<HTMLImageElement>()
  let containerElement = $state<HTMLDivElement>()

  const close = () => {
    onClose()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      close()
    }
  }

  const handleContainerClick = (event: MouseEvent) => {
    if (event.target === containerElement) {
      close()
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div bind:this={containerElement} onclick={handleContainerClick} class="lightbox-container">
  <img bind:this={imageElement} {src} {alt} class="lightbox-image" draggable="false" />
  <div class="close-button">
    <BackButton extraClass="full-width" onclick={close} />
  </div>
</div>

<style lang="scss">
  .lightbox-container {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: black;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .lightbox-image {
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .close-button {
    height: 60px;
    width: 100dvh;
    transform-origin: top left;
    transform: translate(100%, 0) rotate(90deg);
    position: absolute;
    right: 0;
    top: 0;

    :global(.full-width) {
      width: 100dvh;
    }
  }
</style>
