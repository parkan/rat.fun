<script lang="ts">
  import type { Trip as TripSanityDoc, Outcome as OutcomeSanityDoc } from "@sanity-types"

  import { FlashbackEntry } from "$lib/components/Flashback"

  let { data }: { data: { trip: TripSanityDoc; result: OutcomeSanityDoc } } = $props()
  let { trip, result } = data
</script>

<FlashbackEntry {trip} {result} />
