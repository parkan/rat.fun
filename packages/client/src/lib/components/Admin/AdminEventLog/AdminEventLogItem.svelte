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
    point,
    selected,
    focus
  }: {
    point:
      | TripEventVisit
      | TripEventDeath
      | TripEventLiquidation
      | TripEventCreation
      | TripEventDepletion
    selected?: boolean
    focus?: boolean
  } = $props()
</script>

{#if point.eventType === "trip_visit"}
  <span class:selected class:focus class="event-message">
    <span class="handle">@{point.meta?.playerName}</span> RAT SURVIVED #{point.meta?.tripIndex}
  </span>
  <div class:focus class:selected class="event-valuechange">
    <SignedNumber neutralColor="var(--color-neutral);" value={point.valueChange} />
  </div>
{:else if point.eventType === "trip_liquidated"}
  <span class:selected class:focus class="event-message prio-2">
    <span class="event-icon">*</span>
    YOU CASHED OUT TRIP #{point.meta?.index}
  </span>
{:else if point.eventType === "trip_created"}
  <span class:selected class:focus class="event-message prio-2">
    <span class="event-icon">*</span>
    YOU CREATED TRIP #{point.meta?.index}
    <!-- {point.meta.tripCreationCost} -->
  </span>
{:else if point.eventType === "trip_death"}
  <span class:selected class:focus class="event-message">
    <span class="handle">@{point.meta?.playerName}</span> RAT DIED, #{point.meta?.tripIndex}
  </span>
  <div class:focus class:selected class="event-valuechange">
    <SignedNumber neutralColor="var(--color-neutral);" value={point.valueChange} />
  </div>
{:else if point.eventType === "trip_depleted"}
  <span class:selected class:focus class="event-message prio-2">
    <span class="event-icon">*</span>
    TRIP #{point.meta?.index} DEPLETED
  </span>
{/if}

<style lang="scss">
  .handle {
    opacity: 0.5;
  }
  .event-valuechange {
    min-width: 5ch;
    text-align: right;
    display: inline-flex;
    align-self: center;
    height: 100%;
    padding: 4px;

    @media screen and (min-width: 800px) {
      display: inline-block;
      padding: 0px;
      align-self: flex-end;
      justify-self: flex-end;
    }

    &.selected {
      background: var(--background);
    }
    &.focus {
      background: var(--background);
    }
  }

  .event-message {
    padding: 4px 2px;

    @media screen and (min-width: 800px) {
      padding: 0px 0px;
    }
  }
</style>
