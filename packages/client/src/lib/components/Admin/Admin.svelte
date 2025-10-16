<script lang="ts">
  import { onMount } from "svelte"
  import type {
    TripEventBaseline,
    TripEventVisit,
    TripEventDeath,
    TripEventCreation,
    TripEventLiquidation,
    TripEvent,
    PendingTrip
  } from "$lib/components/Admin/types"
  import { TRIP_EVENT_TYPE } from "$lib/components/Admin/enums"

  import { playerTrips } from "$lib/modules/state/stores"
  import { focusEvent } from "$lib/modules/ui/state.svelte"
  import { getModalState } from "$lib/components/Shared/Modal/state.svelte"
  import { backgroundMusic } from "$lib/modules/sound/stores"
  import { playSound } from "$lib/modules/sound"
  import { blockNumberToTimestamp } from "$lib/modules/utils"
  import { staticContent } from "$lib/modules/content"

  import AdminEventLog from "$lib/components/Admin/AdminEventLog/AdminEventLog.svelte"
  import CreateTrip from "$lib/components/Admin/CreateTrip/CreateTrip.svelte"
  import AdminActiveTripTable from "$lib/components/Admin/AdminActiveTripTable/AdminActiveTripTable.svelte"
  import AdminPastTripTable from "$lib/components/Admin/AdminPastTripTable/AdminPastTripTable.svelte"
  import ProfitLossHistoryGraph from "$lib/components/Admin/ProfitLossHistoryGraph/ProfitLossHistoryGraph.svelte"
  import ProfitLossOverview from "$lib/components/Admin/ProfitLossOverview/ProfitLossOverview.svelte"

  let { modal } = getModalState()

  let focus = $state("")
  let pendingTrip = $state<PendingTrip>(null)
  let clientHeight = $state(0)

  // Data processing logic moved from ProfitLossHistoryGraph
  let graphData = $derived.by(() => {
    const trips = Object.values($playerTrips)
    if (!trips.length) return []

    const combinedData: TripEvent[] = []

    trips.forEach(trip => {
      // Get the trip id
      const tripId = Object.keys($playerTrips).find(key => $playerTrips[key] === trip) || ""

      // Abort if no trip id is found
      if (!tripId) {
        return
      }

      // Get trip document from CMS data
      const sanityTripContent = $staticContent?.trips?.find(r => r._id == tripId)

      // Abort if no trip content is found
      if (!sanityTripContent) {
        return
      }

      // Get outcomes for the trip
      const outcomes = $staticContent?.outcomes?.filter(o => o.tripId == tripId) || []

      // Sort the outcomes in order of creation
      outcomes.sort((a, b) => {
        return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
      })

      // Reverse the outcomes
      const tripOutcomes = outcomes.reverse()

      // Creation time of the trip
      const initialTime = new Date(sanityTripContent?._createdAt ?? "").getTime()

      // Build the data array with initial point and outcomes
      const tripData: TripEvent[] = []

      /***************************
       * ADD CREATION EVENT
       **************************/
      tripData.push({
        eventType: TRIP_EVENT_TYPE.CREATION,
        time: initialTime,
        value: 0, // Will be set later in accumulation
        valueChange: -Number(trip.tripCreationCost), // Cost of creating trip
        index: 0, // Will be set later
        tripId: tripId,
        tripCreationCost: Number(trip.tripCreationCost),
        meta: sanityTripContent
      } as TripEventCreation)

      /***************************
       * ADD VISIT/DEATH EVENTS
       **************************/
      tripOutcomes.forEach(outcome => {
        const outcomeTime = new Date(outcome._createdAt).getTime()
        const previousTripValue = outcome.previousTripValue || 0 // ???
        const currentTripValue = outcome.tripValue || 0
        const valueChange = currentTripValue - previousTripValue

        let eventData = {} as TripEventDeath | TripEventVisit

        if (outcome?.ratValue == 0) {
          // Death
          eventData = {
            eventType: TRIP_EVENT_TYPE.DEATH,
            time: outcomeTime,
            value: 0, // Will be set later in accumulation
            valueChange: valueChange,
            index: 0, // Will be set later
            tripId: tripId,
            tripCreationCost: Number(trip.tripCreationCost),
            meta: outcome
          } as TripEventDeath
        } else {
          // Visit
          eventData = {
            eventType: TRIP_EVENT_TYPE.VISIT,
            time: outcomeTime,
            value: 0, // Will be set later in accumulation
            valueChange: valueChange,
            index: 0, // Will be set later
            tripId: tripId,
            tripCreationCost: Number(trip.tripCreationCost),
            meta: outcome
          } as TripEventVisit
        }

        tripData.push(eventData)
      })

      /***************************
       * ADD LIQUIDATION EVENT
       **************************/
      if (trip.liquidationBlock && trip.liquidationValue !== undefined) {
        const liquidationTime = blockNumberToTimestamp(Number(trip.liquidationBlock))

        // Get the last trip value before liquidation
        const lastOutcome = tripOutcomes[tripOutcomes.length - 1]
        const finalTripValue = lastOutcome?.tripValue || 0

        const untaxed = Number(trip.liquidationValue)
        const liquidationValueChange = untaxed - finalTripValue

        // Liquidation: you get back the trip value (before tax) and close the position
        tripData.push({
          eventType: TRIP_EVENT_TYPE.LIQUIDATION,
          time: liquidationTime,
          value: 0, // Will be set later in accumulation
          valueChange: liquidationValueChange,
          index: 0, // Will be set later
          tripId: tripId,
          tripCreationCost: Number(trip.tripCreationCost),
          meta: sanityTripContent
        } as TripEventLiquidation)
      }

      combinedData.push(...tripData)
    })

    // Sort by time
    combinedData.sort((a, b) => a.time - b.time)

    // Find the earliest time
    const earliestTime = combinedData.length > 0 ? combinedData[0].time : Date.now()

    // Add initial 0 point at the start
    const dataWithBaseline = [
      {
        eventType: TRIP_EVENT_TYPE.BASELINE,
        time: earliestTime - 1000, // 1 second before first event
        value: 0,
        valueChange: 0,
        tripId: "",
        tripCreationCost: 0
      } as TripEventBaseline,
      ...combinedData
    ]

    // Now accumulate the value changes globally and add index
    let runningBalance = 0
    return dataWithBaseline.map((point, index) => {
      runningBalance += point.valueChange || 0
      return {
        ...point,
        index,
        value: runningBalance
      }
    })
  })

  onMount(() => {
    $backgroundMusic?.stop()
    $backgroundMusic = playSound("ratfunMusic", "admin", true)
  })
</script>

{#snippet createTripModal()}
  <CreateTrip
    onsubmit={(data: PendingTrip) => {
      modal.hide()
      // Set pending state
      pendingTrip = data
    }}
    ondone={() => {
      // Clear pending state with some delay, so it can be replaced in the list with style
      setTimeout(() => {
        pendingTrip = null
      }, 2000)
    }}
  />
{/snippet}

<div class="admin-container">
  <!-- Top row -->
  <div class="admin-row top">
    <!-- Trip monitor -->
    <div class="trip-monitor-container" bind:clientHeight>
      <div class="p-l-overview">
        <ProfitLossOverview
          onCreateTripClick={() => {
            modal.set(createTripModal)
          }}
        />
      </div>
      <div class="p-l-graph">
        <ProfitLossHistoryGraph {graphData} height={clientHeight} {focus} />
      </div>
    </div>
    <!-- Event log -->
    <div class="event-log-container">
      <AdminEventLog {graphData} bind:focus={$focusEvent} />
    </div>
  </div>
  <!-- Bottom row -->
  <div class="admin-row bottom">
    <!-- Active trips -->
    <div class="active-trip-table-container">
      <AdminActiveTripTable bind:focus {pendingTrip} />
    </div>
    <!-- Divider -->
    <div class="admin-divider warning-mute"></div>
    <!-- Past trips -->
    <div class="past-trip-table-container">
      <AdminPastTripTable bind:focus />
    </div>
  </div>
</div>

<style lang="scss">
  .admin-container {
    position: relative;
    overflow-x: hidden;
    overflow-y: hidden;
    height: var(--game-window-main-height);
    width: var(--game-window-width);
    background-image: url("/images/texture-5.png");
    background-size: 200px;

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;

    .admin-row {
      height: 50%;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
    }

    .trip-monitor-container {
      width: calc(100% - 300px);
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .p-l-overview {
        min-width: 500px;
        width: 500px;
        height: 100%;
      }

      .p-l-graph {
        height: 100%;
        width: 100%;
        background: #222;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .event-log-container {
      height: 100%;
      width: 300px;
    }

    .active-trip-table-container {
      width: calc(50% - 20px);
    }

    .past-trip-table-container {
      width: calc(50% - 20px);
    }

    .admin-divider {
      width: 40px;
    }
  }
</style>
