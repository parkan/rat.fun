<script lang="ts">
  import type { LogEntry } from "@components/Main/RightContainer/RoomResult/types"

  export let logEntry: LogEntry
  export let i: number
  console.log(i)
</script>

<div class="log-entry">
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
