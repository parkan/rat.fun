<script lang="ts">
  import { fade } from "svelte/transition"
  import { linear } from "svelte/easing"
  import type { LogEntry } from "@components/Room/types"

  export let logEntry: LogEntry
  export let i: number

  console.log("i", i)

  function workaroundSvelte5BugWithDelay({
    delay,
    duration,
    easing = linear,
  }: {
    delay: number
    duration: number
    easing?: (t: number) => number
  }) {
    let virtual_duration = delay + duration
    let threshold = delay / virtual_duration
    return {
      duration: virtual_duration,
      easing: (x: number) =>
        x < threshold ? 0 : easing((x - threshold) / (1 - threshold)),
    }
  }
</script>

<div
  class="log-entry"
  in:fade={workaroundSvelte5BugWithDelay({ duration: 200, delay: 100 * i })}
>
  <span class="timestamp">{logEntry.timestamp}</span> –
  <span class="event">{logEntry.event}</span>
</div>

<style lang="scss">
  .log-entry {
    .timestamp {
      color: var(--color-grey-light);
    }
  }
</style>
