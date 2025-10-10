<script lang="ts">
  import type { EnterTripReturnValue } from "@server/modules/types"
  import { frozenRat } from "$lib/components/GameRun/state.svelte"
  import { goto } from "$app/navigation"
  import { ratImageUrl } from "$lib/modules/state/stores"
  import { gsap } from "gsap"
  import { BigButton } from "$lib/components/Shared"

  let {
    result,
    onTimeline
  }: {
    result: EnterTripReturnValue
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>, offset: number | string) => void
  } = $props()

  // Figure out if rat died or survived
  const ratDied = $derived(result?.ratDead)
  const statusText = $derived(ratDied ? "DIED" : "SURVIVED")

  // Elements
  let eventElement = $state<HTMLDivElement | null>(null)

  // Create timeline
  const timeline = gsap.timeline()

  const prepare = () => {
    gsap.set(eventElement, { opacity: 0 })
  }

  const main = () => {
    timeline.to(eventElement, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    })
  }

  const done = () => {
    if (timeline && onTimeline) {
      onTimeline(timeline, 0)
    }
  }

  const run = () => {
    prepare()
    main()
    done()
  }

  $effect(() => {
    if (eventElement) {
      run()
    }
  })
</script>

<div class="event" bind:this={eventElement}>
  <div class="image">
    <img src={$ratImageUrl} alt={$frozenRat?.name} />
  </div>
  <div class="event-text">
    {$frozenRat?.name}
    {statusText}
  </div>
  <div class="button-container">
    <BigButton
      text="COME DOWN"
      onclick={() => {
        goto("/")
      }}
    />
  </div>
</div>

<style lang="scss">
  .event {
    margin: 0;
    padding: 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 90%;

    .image {
      width: 200px;
      height: 200px;
      img {
        width: 100%;
        height: 100%;
      }
    }

    .event-text {
      font-size: var(--font-size-large);
      font-family: var(--special-font-stack);
      margin-bottom: 20px;
    }

    .button-container {
      width: 100%;
      height: 80px;
    }
  }
</style>
