<script lang="ts">
  import type { Hex } from "viem"
  import { trips } from "$lib/modules/state/stores"
  import { TripSEO, GameTripPreview, GameChallengePreview } from "$lib/components/Trip"

  let { data } = $props()

  let trip = $derived($trips[data.tripId])
  let sanityTrip = $derived(data.tripContent)
  let isChallengeTrip = $derived(trip?.challengeTrip ?? false)
</script>

<TripSEO trip={sanityTrip} />

{#if sanityTrip || trip}
  {#if isChallengeTrip}
    <GameChallengePreview {trip} tripId={data.tripId as Hex} sanityTripContent={sanityTrip} />
  {:else}
    <GameTripPreview {trip} tripId={data.tripId as Hex} sanityTripContent={sanityTrip} />
  {/if}
{/if}
