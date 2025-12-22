<script lang="ts">
  import type { TripEvent } from "$lib/components/Admin/types"
  import { OutcomeLog } from "$lib/components/Shared"
  let { event }: { event: TripEvent } = $props()
</script>

<div class="introspection">
  {#if event && (event.eventType === "trip_visit" || event.eventType === "trip_death")}
    <OutcomeLog outcome={event.meta} />
  {/if}
</div>

<style>
  .introspection {
    height: 100%;
  }
</style>
