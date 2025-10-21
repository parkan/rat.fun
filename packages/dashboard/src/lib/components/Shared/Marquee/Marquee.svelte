<script lang="ts">
  import { onMount } from "svelte"

  let {
    text,
    direction,
    speed,
    pauseOnHover = false
  }: {
    text: string
    direction: "left" | "right"
    speed: number
    pauseOnHover?: boolean
  } = $props()

  let containerElement: HTMLDivElement
  let textElement: HTMLDivElement
  let animationDuration = $state(0)
  let isPaused = $state(false)
  let repetitions = $state(1)
  let translateDistance = $state(0)

  function onmouseenter() {
    if (pauseOnHover) {
      isPaused = true
    }
  }

  function onmouseleave() {
    if (pauseOnHover) {
      isPaused = false
    }
  }

  onMount(() => {
    if (textElement && containerElement) {
      const containerWidth = containerElement.offsetWidth
      const textWidth = textElement.offsetWidth

      if (textWidth > 0 && containerWidth > 0) {
        // Calculate how many repetitions we need to fill the container
        // We need enough repetitions to fill the container plus some buffer for seamless scrolling
        repetitions = Math.max(2, Math.ceil((containerWidth * 4) / textWidth))

        // Calculate duration for consistent speed regardless of text length
        // Speed represents pixels per second of movement
        // We animate by exactly one text width to create seamless loop
        translateDistance = textWidth
        animationDuration = translateDistance / speed
      } else {
        animationDuration = 0
        repetitions = 2
      }
    }
  })
</script>

<div
  bind:this={containerElement}
  class="marquee-container"
  {onmouseenter}
  {onmouseleave}
  role="marquee"
  aria-label="Scrolling text: {text}"
>
  <div
    bind:this={textElement}
    class="marquee-text"
    class:paused={isPaused}
    style:animation-duration="{animationDuration}s"
    style:animation-direction={direction === "left" ? "normal" : "reverse"}
    style:--translate-distance="{translateDistance}px"
  >
    {#each Array(repetitions) as _, i}
      {text}{#if i < repetitions - 1}
        &nbsp;{/if}
    {/each}
  </div>
</div>

<style>
  .marquee-container {
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .marquee-text {
    display: inline-block;
    white-space: nowrap;
    animation: marquee linear infinite;
    animation-play-state: running;
  }

  .marquee-text.paused {
    animation-play-state: paused;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0px);
    }
    100% {
      transform: translateX(calc(-1 * var(--translate-distance)));
    }
  }

  /* Ensure text doesn't wrap */
  .marquee-text {
    white-space: nowrap;
  }
</style>
