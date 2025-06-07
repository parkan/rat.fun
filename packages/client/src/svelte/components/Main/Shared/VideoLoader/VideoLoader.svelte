<script lang="ts">
  import { onMount } from "svelte"
  const { text }: { text?: string } = $props()

  let progress = $state(0)
  let animationFrame: number
  const startTime = Date.now()
  const duration = 4000 // 4 seconds
  const targetProgress = 0.99 // Will approach but never reach 100%

  function easing(t: number): number {
    return Math.sin((t * Math.PI) / 2)
  }

  function animate() {
    const elapsed = Date.now() - startTime
    const t = Math.min(elapsed / duration, 1)
    // Use easeOutQuad for smooth deceleration
    progress = targetProgress * easing(t)
    if (t < 1) {
      animationFrame = requestAnimationFrame(animate)
    }
  }

  // Start animation when component mounts
  onMount(() => {
    animate()
  })
</script>

<div class="video-loader">
  {#if text}
    <div class="text">{text}</div>
  {/if}
  <div class="loading-bar-container">
    <div class="loading-bar" style="transform: scaleX({progress})"></div>
  </div>
  <video src="/videos/loading.mov" autoplay loop muted playsinline></video>
</div>

<style lang="scss">
  .video-loader {
    text-align: center;
    color: var(--white);
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    .text {
      font-size: 200px;
      color: red;
      mix-blend-mode: multiply;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }

    .loading-bar-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;
      z-index: 2;
    }

    .loading-bar {
      width: 100%;
      height: 100%;
      background: white;
      transform-origin: left;
      transition: transform 16ms linear;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
</style>
