<script lang="ts">
  import type { ServerReturnValue } from "@components/Main/RoomResult/types"
  import LogItem from "@components/Main/RoomResult/Log/LogItem.svelte"
  import { mergeLog } from "./index"

  export let result: ServerReturnValue

  // Merge log events with corresponding outcomes
  const mergedLog = mergeLog(result)
</script>

<div class="log">
  {#each mergedLog as logEntry, i (i)}
    <LogItem {logEntry} {i} />
  {/each}
</div>

<style lang="scss">
  .log {
    margin-bottom: 20px;
  }
</style>
