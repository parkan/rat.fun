<script lang="ts">
  // import { TripReport } from "$lib/components/GameRun"
  // import { page } from "$app/state"
  // import { onMount } from "svelte"
  // import { replaceState } from "$app/navigation"
  // import { stringifyWithBigInt, parseWithBigInt } from "$lib/modules/state/utils"
  // import { TRIP_STATE, frozenRat, frozenRoom } from "$lib/components/GameRun/state.svelte"
  // import type { RoomEntryState } from "$lib/components/GameRun/types"

  let { data }: { data: { room: Room; result: any } } = $props()
  let { room, result } = data

  console.log("### routes/(main)/tripopedia/[outcomeId]/+page@.svelte ###")
  console.log("### room ###", room)
  console.log("### result ###", result)

  // console.log("### routes/(main)/(game)/[roomId]/tripopedia/[outcomeId]/+page@.svelte ###")

  // frozenRoom.set(data.entryState.frozenRoom)
  // frozenRat.set(data.entryState.frozenRat)

  // let entryState = $state(
  //   page.state?.entryState
  //     ? parseWithBigInt(stringifyWithBigInt(page.state.entryState))
  //     : data?.entryState || {}
  // ) as RoomEntryState
  // let result = $derived(entryState?.result)
  // let { transitionToResultSummary } = $derived(createTripTransitions(entryState))

  // onMount(() => {
  //   if (page.state?.entryState) {
  //     // Clear the entryState from page state
  //     replaceState(page.url.pathname, {})
  //   }
  // })
</script>

<!-- {#if entryState?.state === TRIP_STATE.RESULTS || (entryState?.state
    ?.toLowerCase()
    .includes("summary") && result)}
  <TripReport
    {result}
    {entryState}
    onComplete={() => {
      transitionToResultSummary(result)
    }}
  />
{/if} -->

<!-- Error -->
<!-- {#if entryState?.state === TRIP_STATE.ERROR}
  <div class="error">
    {entryState?.errorMessage}
  </div>
{/if} -->
