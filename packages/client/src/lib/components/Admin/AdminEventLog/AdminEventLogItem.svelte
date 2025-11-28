<script lang="ts">
  import type {
    TripEventVisit,
    TripEventDeath,
    TripEventLiquidation,
    TripEventCreation,
    TripEventDepletion
  } from "$lib/components/Admin/types"
  import { SignedNumber } from "$lib/components/Shared"

  let {
    point
  }: {
    point:
      | TripEventVisit
      | TripEventDeath
      | TripEventLiquidation
      | TripEventCreation
      | TripEventDepletion
  } = $props()
</script>

{#if point.eventType === "trip_visit"}
  <span class="event-message">
    {point.meta?.playerName} sent rat to trip #{point.meta?.tripIndex}
  </span>
  <div class="event-valuechange">
    <SignedNumber neutralColor="rgba(255, 255, 0, 1);" value={point.valueChange} />
  </div>
{:else if point.eventType === "trip_liquidated"}
  <span class="event-message prio-2">
    <span class="event-icon">*</span>
    You liquidated trip #{point.meta?.index}
  </span>
  <div class="event-valuechange"></div>
{:else if point.eventType === "trip_created"}
  <span class="event-message prio-2">
    <span class="event-icon">*</span>
    You created trip #{point.meta?.index}
    <!-- {point.meta.tripCreationCost} -->
  </span>
  <div class="event-valuechange">
    <SignedNumber neutralColor="rgba(255, 255, 0, 1);" hideZero value={point.valueChange} />
  </div>
{:else if point.eventType === "trip_death"}
  <span class="event-message">
    {point.meta?.playerName}'s rat died in trip #{point.meta?.tripIndex}
  </span>
  <div class="event-valuechange">
    <SignedNumber neutralColor="rgba(255, 255, 0, 1);" value={point.valueChange} />
  </div>
{:else if point.eventType === "trip_depleted"}
  <span class="event-message prio-2">
    <span class="event-icon">*</span>
    Trip #{point.meta?.index} got depleted
  </span>
  <div class="event-valuechange"></div>
{/if}

<style lang="scss">
  .event {
    display: block;
    padding: 0;
    margin: 0;
    color: white;
    background-color: var(--color-button);
    cursor: pointer;
    font-size: var(--font-size-small);
    width: 100%;
    margin-bottom: 4px;
    font-family: var(--admin-font-stack);
    padding-top: 2px;
    padding-bottom: 4px;
    border: none;
    border-style: outset;
    border-width: 2px;
    border-color: rgba(0, 0, 0, 0.3);

    .prio-2 {
      color: var(--color-grey-mid);
    }

    &.selected {
      background: white;
      color: black;
    }

    &.trip_visit:not(.selected) {
      &.positive {
        background: rgba(0, 255, 0, 0.4);
      }
      &.negative {
        background: rgba(255, 0, 0, 0.4);
      }
      &.neutral {
        background: rgba(255, 255, 0, 0.4);
      }

      &.hovered {
        background: purple !important;
        &.positive {
          background: rgba(0, 255, 0, 0.6);
        }
        &.negative {
          background: rgba(255, 0, 0, 0.6);
        }
        &.neutral {
          background: rgba(255, 255, 0, 0.6);
        }
      }
    }
  }
</style>
