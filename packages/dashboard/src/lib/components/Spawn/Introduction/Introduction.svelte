<script lang="ts">
  import { onMount, tick } from "svelte"
  import gsap from "gsap"
  import { playSound } from "$lib/modules/sound"
  import { UIState } from "$lib/modules/ui/state.svelte"
  import { UI } from "$lib/modules/ui/enums"

  let { height }: { height: number } = $props()

  let logoElement: HTMLDivElement | null = $state(null)
  let layer4Element: HTMLDivElement | null = $state(null)
  let layer3Element: HTMLDivElement | null = $state(null)
  let layer2Element: HTMLDivElement | null = $state(null)

  let isAnimating = $state(false)

  const enterTimeline = gsap.timeline({ paused: true })
  const exitTimeline = gsap.timeline()

  onMount(async () => {
    isAnimating = true

    // Starting states
    enterTimeline.set([layer2Element, layer3Element, layer4Element], {
      scale: 0,
      rotation: 0
    })

    enterTimeline.set(logoElement, {
      opacity: 0
    })

    // Play sound
    enterTimeline.call(
      () => {
        playSound("ratfunUI", "logoIn")
      },
      [],
      "0.5"
    )

    // Fade in whole logo
    enterTimeline.to(
      logoElement,
      {
        duration: 0.7,
        opacity: 0.7,
        ease: "power2.out"
      },
      "0.5"
    )

    // Scale in text layers
    enterTimeline.to(
      [layer2Element, layer4Element],
      {
        duration: 0.7,
        scale: 1,
        ease: "bounce.out(2.5)"
      },
      "0.5"
    )

    // Scale in mascot layer
    enterTimeline.to(
      layer3Element,
      {
        duration: 1,
        scale: 1,
        ease: "bounce.out(2.5)"
      },
      "0.5"
    )

    // Animation complete
    enterTimeline.call(() => {
      isAnimating = false
    })

    // Due to how the loading/spawning sequence currently works
    // we will pass through here before the UI state is updated
    // we wait for the next tick to ensure the UI state is updated
    await tick()
    if ($UIState === UI.SPAWNING) {
      enterTimeline.play()
    }
  })

  const onmouseup = () => {
    if (isAnimating) return

    isAnimating = true
    playSound("ratfunUI", "logoClick")

    // Fade out text and mascot layers
    exitTimeline.to(
      [layer2Element, layer4Element, layer3Element],
      {
        opacity: 0,
        duration: 0.1,
        ease: "power2.out"
      },
      "0"
    )

    // Animate out whole logo
    exitTimeline.to(
      logoElement,
      {
        scale: 0,
        duration: 0.7,
        rotation: 360,
        ease: "power2.out"
      },
      "0"
    )

    exitTimeline.call(onComplete)
  }

  const onmousedown = () => {
    if (isAnimating) return

    playSound("ratfunUI", "smallButtonDown")

    gsap.to(logoElement, {
      scale: 1.2,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  const onmouseenter = () => {
    if (isAnimating) return

    playSound("ratfunUI", "smallButtonDown")

    // Animate highlight on mascot layer
    gsap.to(layer3Element, {
      scale: 1.2,
      rotation: -10,
      duration: 0.2,
      ease: "expo.out"
    })

    // Animate background layer
    // gsap.to([layer1Element], {
    //   rotation: 10,
    //   duration: 0.1,
    //   ease: "power2.out"
    // })
  }

  const onmouseleave = () => {
    if (isAnimating) return

    playSound("ratfunUI", "smallButtonUp")

    // Reset mascot layer
    gsap.to(layer3Element, {
      scale: 1,
      rotation: 0,
      duration: 0.2,
      ease: "power2.out"
    })

    // Reset background layer
    // gsap.to([layer1Element], {
    //   rotation: 0,
    //   duration: 0.1,
    //   ease: "power2.out"
    // })
  }
</script>

<div style:height="{height}px" class="outer-container">
  <button {onmouseenter} {onmouseleave} {onmouseup} {onmousedown} class:animating={isAnimating}>
    <div class="logo" style:width="{height}px" bind:this={logoElement}>
      <!-- LAYER 4-->
      <div class="layer layer-4" bind:this={layer4Element}>
        <img src="/logo/logo-layer-4.png" draggable={false} alt="RAT.FUN" />
      </div>
      <!-- LAYER 3-->
      <div class="layer layer-3" bind:this={layer3Element}>
        <img src="/logo/logo-layer-3.png" draggable={false} alt="RAT.FUN" />
      </div>
      <!-- LAYER 2-->
      <div class="layer layer-2" bind:this={layer2Element}>
        <img src="/logo/logo-layer-2.png" draggable={false} alt="RAT.FUN" />
      </div>
      <!-- LAYER 1 -->
      <!-- <div class="layer layer-1" bind:this={layer1Element}>
        <img src="/logo/logo-layer-1.png" draggable={false} alt="RAT.FUN" />
      </div> -->
    </div>
  </button>
</div>

<style lang="scss">
  .outer-container {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    color: white;

    button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      outline: none;
      mix-blend-mode: screen;
      height: fit-content;
      width: fit-content;

      &.animating {
        pointer-events: none;
      }

      .logo {
        position: relative;
        max-width: 80dvw;
        aspect-ratio: 1/1;
        object-fit: contain;

        .layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;

          &.layer-1 {
            z-index: 1;
          }
          &.layer-2 {
            z-index: 2;
          }
          &.layer-3 {
            z-index: 3;
          }
          &.layer-4 {
            z-index: 4;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
      }
    }
  }
</style>
