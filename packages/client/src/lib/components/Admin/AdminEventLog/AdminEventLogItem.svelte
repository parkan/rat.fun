<script lang="ts">
  import type {
    TripEventVisit,
    TripEventDeath,
    TripEventLiquidation,
    TripEventCreation
  } from "$lib/components/Admin/types"
  import { TRIP_EVENT_TYPE } from "$lib/components/Admin/enums"
  import { Icon } from "$lib/components/Shared"
  import { timeSince } from "$lib/modules/utils"

  let {
    point,
    behavior = "click",
    localFocusEvent,
    setLocalFocusEvent
  }: {
    point: TripEventVisit | TripEventDeath | TripEventLiquidation | TripEventCreation
    behavior?: "hover" | "click"
    localFocusEvent?: number
    setLocalFocusEvent: (index: number) => void
  } = $props()

  const focus = $derived(localFocusEvent === point.index)

  const href = $derived.by(() => {
    // For visit and death events, meta is SanityOutcome
    if (point.eventType === TRIP_EVENT_TYPE.VISIT || point.eventType === TRIP_EVENT_TYPE.DEATH) {
      return `/admin/${point.meta?.tripId}?focusId=${point.meta._id}`
    } else if (
      point.eventType === TRIP_EVENT_TYPE.LIQUIDATION ||
      point.eventType === TRIP_EVENT_TYPE.CREATION
    ) {
      // For liquidation and creation events, meta is SanityTrip
      return `/admin/${point.meta._id}`
    }
  })

  const onpointerdown = () => {
    // ...
  }

  const onpointerup = () => {
    if (behavior === "click") {
      setLocalFocusEvent(point.index)
    }
  }

  const onpointerenter = () => {
    if (behavior === "hover") {
      setLocalFocusEvent(point.index)
    }
  }

  const onpointerleave = () => {
    if (behavior === "hover") {
      setLocalFocusEvent(-1)
    }
  }
</script>

{#snippet ratVisitEvent(p: TripEventVisit | TripEventDeath)}
  <Icon name="Paw" address={p.meta?.playerName} width={10} />
  {p.meta?.playerName} sent {p.meta?.ratName} to trip #{p.meta?.tripIndex}
{/snippet}

{#snippet ratDied(p: TripEventDeath)}
  <Icon width={10} name="Cross" fill="white" />
  {p.meta?.ratName} died tripping #{p.meta?.tripIndex}
{/snippet}

{#snippet tripLiquidated(p: TripEventLiquidation)}
  <Icon width={10} name="Handshake" fill="white" /> You liquidated trip #{p.meta?.index}
{/snippet}

{#snippet tripCreated(p: TripEventCreation)}
  <Icon width={10} name="Asterisk" fill="white" /> You created trip #{p.meta?.index}
{/snippet}

<a class="event" {href} {onpointerdown} {onpointerup} {onpointerenter} {onpointerleave} class:focus>
  {#if point.eventType === "trip_visit"}
    {@render ratVisitEvent(point)}
  {:else if point.eventType === "trip_liquidated"}
    {@render tripLiquidated(point)}
  {:else if point.eventType === "trip_created"}
    {@render tripCreated(point)}
  {:else if point.eventType === "trip_death"}
    {@render ratDied(point)}
  {/if}
  <span class="meta">{timeSince(new Date(point.time).getTime())}</span>
</a>

<style lang="scss">
  .event {
    padding: 0;
    margin: 0;
    color: white;
    display: block;
    margin-bottom: 4px;
    cursor: pointer;
    font-size: var(--font-size-small);

    .meta {
      font-size: var(--font-size-small);
      color: var(--color-grey-light);
      text-align: center;
      margin-bottom: 20px;
    }

    &.focus {
      background: black;
    }
  }
</style>
