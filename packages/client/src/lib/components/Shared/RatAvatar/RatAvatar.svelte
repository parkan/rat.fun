<script lang="ts">
  import { player } from "$lib/modules/state/stores"
  import { addressToRatParts } from "$lib/modules/utils"
  import { staticContent } from "$lib/modules/content"
  import { playSound } from "$lib/modules/sound"
  import { NoImage } from "$lib/components/Shared"
  import gsap from "gsap"

  type RatAnimation = "idle" | "appearance" | "survived" | "died" | "dead"

  let {
    animation = "idle",
    inert = false
  }: {
    animation?: RatAnimation
    inert?: boolean
  } = $props()

  let images = $derived(addressToRatParts($player?.currentRat, $staticContent?.ratImages))

  // Element references for GSAP
  let bodyElement: HTMLDivElement | null = $state(null)
  let armsElement: HTMLDivElement | null = $state(null)
  let headElement: HTMLDivElement | null = $state(null)
  let earsElement: HTMLDivElement | null = $state(null)

  const onmousedown = (e: MouseEvent) => {
    if (inert) return false
    if (!bodyElement || !armsElement || !headElement || !earsElement) return false
    playSound("ratfunUI", "glassTap")

    // Calculate click position relative to container center
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    // const movementX = (e.pageX - rect.left - rect.width / 2) / 5
    // const movementY = (e.pageY - rect.top - rect.height / 2) / 5

    // Animate head and ears with scale and directional movement
    gsap.to([headElement, earsElement], {
      scale: 1.2,
      rotation: 10,
      // x: movementX,
      // y: movementY,
      duration: 0.2,
      ease: "elastic.out(1.5)"
    })

    // Reset after 600ms (matching Mascot's timing)
    setTimeout(() => {
      gsap.to([headElement, earsElement], {
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
        duration: 0.2,
        ease: "elastic.out(1.5)"
      })

      gsap.to(armsElement, {
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: "elastic.out(1.5)"
      })
    }, 600)
  }
</script>

<div {onmousedown} class="rat-container" role="button" tabindex="0">
  {#if images && images.every(image => image.length > 0)}
    <!-- BODY -->
    <div class="layer ratBodies {animation}" bind:this={bodyElement}>
      <img draggable="false" class="inner" src={images[0]} alt="" />
    </div>
    <!-- ARMS -->
    <div class="layer ratArms {animation}" bind:this={armsElement}>
      <img draggable="false" class="inner" src={images[1]} alt="" />
    </div>
    <!-- HEAD -->
    <div class="layer ratHeads {animation}" bind:this={headElement}>
      <img draggable="false" class="inner" src={images[2]} alt="" />
    </div>
    <!-- EARS -->
    <div class="layer ratEars {animation}" bind:this={earsElement}>
      <img draggable="false" class="inner" src={images[3]} alt="" />
    </div>
  {:else}
    <NoImage />
  {/if}
</div>

<style lang="scss">
  .rat-container {
    width: 260px;
    height: 260px;
    display: block;
    position: relative;
    cursor: grab;
    user-select: none;
  }

  .layer {
    position: absolute;
    width: 260px;
    inset: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &.ratBodies {
      transform-origin: 50% 100%;
    }

    &.ratArms {
      transform-origin: 50% 100%;
    }

    &.ratEars,
    &.ratHeads {
      // transform-origin: 50% 150%;
    }
  }

  img {
    pointer-events: none;
  }
</style>
