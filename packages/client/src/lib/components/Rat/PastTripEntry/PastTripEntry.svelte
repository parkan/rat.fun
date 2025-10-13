<script lang="ts">
  import { staticContent } from "$lib/modules/content"
  import { FlashbackEntry } from "$lib/components/Flashback"
  import { transitionTo, RAT_BOX_STATE } from "$lib/components/Rat/state.svelte"

  let { outcomeId }: { outcomeId: string } = $props()

  let result = $derived($staticContent.outcomes.find(o => o._id == outcomeId))
  let trip = $derived($staticContent.trips.find(r => r._id == result?.tripId))
</script>

<div class="past-trip-entry">
  <button class="back-button" onclick={() => transitionTo(RAT_BOX_STATE.PAST_TRIP_LIST)}>
    Go Back
  </button>
  <FlashbackEntry {trip} {result} />
</div>

<style lang="scss">
</style>
