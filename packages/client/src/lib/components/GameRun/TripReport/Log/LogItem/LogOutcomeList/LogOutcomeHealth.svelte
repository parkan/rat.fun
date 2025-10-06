<script lang="ts">
  import { gsap } from "gsap"
  import { updateFrozenState } from "$lib/components/GameRun/state.svelte"
  import { playSound } from "$lib/modules/sound"
  import { OUTCOME_DURATION } from "$lib/components/GameRun/TripReport/Log/config"

  let {
    negative,
    value,
    onTimeline
  }: {
    negative: boolean
    value: string
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>) => void
  } = $props()

  // Element
  let outcomeElement = $state<HTMLDivElement | null>(null)

  // Timeline
  const timeline = gsap.timeline()

  // Stage 1: Prepare the animation
  const prepare = () => {
    // Ensure outcome starts invisible
    gsap.set(outcomeElement, {
      opacity: 0
    })
  }

  // Stage 2: Main animation
  const main = () => {
    // State update
    timeline.call(updateFrozenState, [
      {
        type: "balance",
        action: negative ? "reduce" : "increase",
        value: 0, // Will be filled by parent if needed
        name: "Balance"
      }
    ])

    // Sound
    timeline.call(() => {
      playSound("ratfunUI", "boing")
    })

    // Visual animation
    timeline.to(outcomeElement, {
      opacity: 1,
      duration: OUTCOME_DURATION,
      ease: "power2.out"
    })
  }

  // Timeline is constructed
  // Pass it to the parent component
  const done = () => {
    if (timeline && onTimeline) {
      onTimeline(timeline)
    }
  }

  // Run once
  const run = () => {
    prepare()
    main() // Build the timeline synchronously
    done() // Call done immediately after building
  }

  // Ensure root element is mounted
  $effect(() => {
    if (outcomeElement) {
      run()
    }
  })
</script>

<div class="outcome" class:negative bind:this={outcomeElement}>
  <span class="value">{value}</span>
</div>

<style lang="scss">
  .outcome {
    background: var(--color-success);
    color: var(--background);
    font-size: var(--font-size-small);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 10px;
    font-size: var(--font-size-normal);

    background: var(--color-value);
    color: var(--background);

    &.negative {
      background: var(--color-death);
    }
  }
</style>
