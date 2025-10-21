<script lang="ts">
  import { onMount } from "svelte"
  import gsap from "gsap"
  import { playSound } from "$lib/modules/sound"

  let {
    entranceOn = false,
    bigDanceOn = false,
    smallDanceOn = false
  }: { entranceOn?: boolean; bigDanceOn?: boolean; smallDanceOn?: boolean } = $props()

  let isAnimating = $state(false)

  const enterTimeline = gsap.timeline({ paused: true })
  const bigDanceTimeline = gsap.timeline({ repeat: -1, yoyo: true })
  const smallDanceTimeline = gsap.timeline({ repeat: -1, yoyo: true })

  // Elements
  let mascotElement: HTMLDivElement | null = $state(null)
  let layer4Element: HTMLDivElement | null = $state(null)
  let layer3Element: HTMLDivElement | null = $state(null)
  let layer2Element: HTMLDivElement | null = $state(null)
  let layer1Element: HTMLDivElement | null = $state(null)

  onMount(async () => {
    isAnimating = true

    // Starting states
    if (entranceOn) {
      enterTimeline.set(mascotElement, {
        opacity: 0,
        scale: 0
      })

      // Play sound
      enterTimeline.call(
        () => {
          playSound("ratfunUI", "logoIn")
        },
        [],
        "0.5"
      )

      // Animate in whole mascot
      enterTimeline.to(
        mascotElement,
        {
          duration: 0.7,
          opacity: 0.7,
          scale: 1,
          ease: "elastic.out(1.5)"
        },
        "0.5"
      )

      // Animation complete
      enterTimeline.call(() => {
        isAnimating = false
      })

      enterTimeline.play()
    }

    if (bigDanceOn) {
      setupBigDanceTimeline()
    } else if (smallDanceOn) {
      setupSmallDanceTimeline()
    }
  })

  const setupBigDanceTimeline = () => {
    // Body
    bigDanceTimeline.to(
      layer1Element,
      {
        rotation: -2,
        duration: 0.4,
        ease: "sine.inOut"
      },
      "<"
    )

    // Arms
    bigDanceTimeline.to(
      layer2Element,
      {
        rotation: 4,
        duration: 0.4,
        ease: "expo.inOut"
      },
      "<"
    )

    // Head
    bigDanceTimeline.to(
      layer3Element,
      {
        scale: 1.5,
        rotation: -4,
        duration: 0.4,
        ease: "expo.inOut"
      },
      "<"
    )

    // Hat
    bigDanceTimeline.to(
      layer4Element,
      {
        scale: 1.5,
        y: -30,
        rotation: 4,
        duration: 0.4,
        ease: "expo.inOut"
      },
      "<"
    )

    // Start the dance timeline
    bigDanceTimeline.play()
  }

  const setupSmallDanceTimeline = () => {
    // Arms + head
    smallDanceTimeline.to([layer2Element, layer3Element], {
      rotation: -2,
      duration: 0.4,
      ease: "sine.inOut"
    })

    // Arms + head
    smallDanceTimeline.to([layer2Element, layer3Element], {
      rotation: 2,
      duration: 0.4,
      ease: "sine.inOut"
    })

    // Start the dance timeline
    smallDanceTimeline.play()
  }

  const onmouseup = () => {}

  const onmousedown = () => {}

  const onmouseenter = () => {}

  const onmouseleave = () => {}
</script>

<button {onmouseenter} {onmouseleave} {onmouseup} {onmousedown} class:animating={isAnimating}>
  <div class="mascot" bind:this={mascotElement}>
    <!-- LAYER 4-->
    <div class="layer layer-4" bind:this={layer4Element}>
      <img src="/images/mascot/mascot-layer-4.png" draggable={false} alt="RAT.FUN" />
    </div>
    <!-- LAYER 3-->
    <div class="layer layer-3" bind:this={layer3Element}>
      <img src="/images/mascot/mascot-layer-3.png" draggable={false} alt="RAT.FUN" />
    </div>
    <!-- LAYER 2-->
    <div class="layer layer-2" bind:this={layer2Element}>
      <img src="/images/mascot/mascot-layer-2.png" draggable={false} alt="RAT.FUN" />
    </div>
    <!-- LAYER 1 -->
    <div class="layer layer-1" bind:this={layer1Element}>
      <img src="/images/mascot/mascot-layer-1.png" draggable={false} alt="RAT.FUN" />
    </div>
  </div>
</button>

<style lang="scss">
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    outline: none;
    height: 100%;
    width: 100%;

    &.animating {
      pointer-events: none;
    }

    .mascot {
      position: relative;
      width: 100%;
      height: 100%;
      aspect-ratio: 1/1;
      object-fit: contain;
      opacity: 0.7;

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
</style>
