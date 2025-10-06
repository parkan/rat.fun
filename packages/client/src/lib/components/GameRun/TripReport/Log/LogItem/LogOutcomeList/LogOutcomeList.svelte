<script lang="ts">
  import type { MergedLogEntry } from "$lib/components/GameRun/types"
  import { gsap } from "gsap"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"
  import { OUTCOME_START_DELAY, OUTCOME_DELAY } from "$lib/components/GameRun/TripReport/Log/config"
  import LogOutcomeItem from "./LogOutcomeItem.svelte"
  import LogOutcomeHealth from "./LogOutcomeHealth.svelte"

  let {
    logEntry,
    onTimeline
  }: {
    logEntry: MergedLogEntry
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>) => void
  } = $props()

  // Timeline
  const timeline = gsap.timeline()

  // Store outcome timelines for sequencing
  let outcomeTimelines: ReturnType<typeof gsap.timeline>[] = []

  // Handle individual outcome timeline
  const addOutcomeTimeline = (outcomeTimeline: ReturnType<typeof gsap.timeline>) => {
    outcomeTimelines.push(outcomeTimeline)
  }

  // Stage 2: Main animation
  const main = () => {
    // Add a label to mark the start of outcome animations
    timeline.addLabel("outcomesStart", `+=${OUTCOME_START_DELAY}`)

    // Add each outcome timeline sequentially
    outcomeTimelines.forEach((outcomeTimeline, index) => {
      const outcomeStartTime = `outcomesStart+=${index * OUTCOME_DELAY}`
      timeline.add(outcomeTimeline, outcomeStartTime)
    })

    timeline.addLabel("outcomesFinish", "+=2")
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
    main() // Build the timeline synchronously
    done() // Call done immediately after building
  }

  // Ensure timeline is built regardless of whether there are outcomes
  $effect(() => {
    // Always run - even if no outcomes, we need to export an empty timeline
    run()
  })
</script>

<div class="outcome-list">
  {#if logEntry.balanceTransfer}
    <div class="outcome-wrapper">
      <LogOutcomeHealth
        negative={logEntry.balanceTransfer.amount < 0}
        value={`${CURRENCY_SYMBOL}${logEntry.balanceTransfer.amount}`}
        onTimeline={addOutcomeTimeline}
      />
    </div>
  {/if}
  {#if logEntry?.itemChanges}
    {#each logEntry?.itemChanges as itemChange}
      <div class="outcome-wrapper">
        <LogOutcomeItem
          negative={itemChange.type === "remove"}
          value={`${itemChange.name} (${CURRENCY_SYMBOL}${itemChange.value})`}
          onTimeline={addOutcomeTimeline}
        />
      </div>
    {/each}
  {/if}
</div>

<style lang="scss">
  .outcome-list {
    margin-left: 10px;
    display: flex;
    flex-direction: row;
    gap: 5px;
    flex-wrap: wrap;
  }
</style>
