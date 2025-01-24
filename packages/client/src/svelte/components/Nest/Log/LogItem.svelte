<script lang="ts">
  import { fade } from "svelte/transition"
  import type { LogEntry } from "@components/Nest/types"

  export let logEntry: LogEntry
  export let i: number
</script>

<div class="log-entry" in:fade={{ duration: 200, delay: 500 * i }}>
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
