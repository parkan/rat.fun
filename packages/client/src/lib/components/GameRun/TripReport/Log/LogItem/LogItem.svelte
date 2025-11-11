<script lang="ts">
  import type { MergedLogEntry } from "$lib/components/GameRun/types"
  import { gsap } from "gsap"

  import { LogTimestamp, LogOutcomeList } from "$lib/components/GameRun"
  import LogText from "./LogText.svelte"

  let {
    logEntry,
    delay = 0,
    onTimeline
  }: {
    logEntry: MergedLogEntry
    delay: number
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>) => void
  } = $props()

  // Elements
  let logItemElement = $state<HTMLDivElement | null>(null)

  // Timeline
  const timeline = gsap.timeline({ delay })

  // Store child timelines for later addition
  let logTextTimeline: ReturnType<typeof gsap.timeline> | null = null
  let logTimestampTimeline: ReturnType<typeof gsap.timeline> | null = null
  let logOutcomeListTimeline: ReturnType<typeof gsap.timeline> | null = null

  // Track completion of child timeline collection
  let receivedChildTimelines = 0
  const expectedChildTimelines = 3 // LogTimestamp, LogText, LogOutcomeList

  // Helper function to check if all child timelines are collected and build timeline
  const checkAndBuildTimeline = () => {
    receivedChildTimelines++
    if (receivedChildTimelines === expectedChildTimelines) {
      buildMainTimeline()
    }
  }

  // Handle LogTimestamp timeline - store it for later addition
  const addLogTimestampTimeline = (timestampTimeline: ReturnType<typeof gsap.timeline>) => {
    logTimestampTimeline = timestampTimeline
    checkAndBuildTimeline()
  }

  // Handle LogText timeline - store it for later addition
  const addLogTextTimeline = (textTimeline: ReturnType<typeof gsap.timeline>) => {
    logTextTimeline = textTimeline
    checkAndBuildTimeline()
  }

  // Handle LogOutcomeList timeline - store it for later addition
  const addLogOutcomeListTimeline = (outcomeListTimeline: ReturnType<typeof gsap.timeline>) => {
    logOutcomeListTimeline = outcomeListTimeline
    checkAndBuildTimeline()
  }

  // Build the main timeline - only called when all child timelines are collected
  const buildMainTimeline = () => {
    // Add LogTimestamp timeline at the start
    if (logTimestampTimeline) {
      timeline.add(logTimestampTimeline)
    }

    // Add LogText timeline after timestamp completes
    if (logTextTimeline) {
      timeline.add(logTextTimeline)
    }

    // Add LogOutcomeList timeline after text completes
    if (logOutcomeListTimeline) {
      timeline.add(logOutcomeListTimeline)
    }

    // Pass the complete timeline to parent
    done()
  }

  // Timeline is constructed
  // Pass it to the parent component
  const done = () => {
    if (timeline && onTimeline) {
      onTimeline(timeline)
    }
  }
</script>

<div class="log-item" bind:this={logItemElement}>
  <LogTimestamp {logEntry} onTimeline={addLogTimestampTimeline} />
  <LogText {logEntry} onTimeline={addLogTextTimeline} />
  <LogOutcomeList {logEntry} onTimeline={addLogOutcomeListTimeline} />
</div>

<style lang="scss">
  .log-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.5em;
    min-height: 40px;
  }
</style>
