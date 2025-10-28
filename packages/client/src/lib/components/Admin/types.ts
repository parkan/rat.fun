import type { Outcome as SanityOutcome, Trip as SanityTrip } from "@sanity-types"
import type { TRIP_EVENT_TYPE } from "$lib/components/Admin/enums"

export type PendingTrip = { prompt: string; cost: number } | null

export type TripEventShared = {
  eventType: TRIP_EVENT_TYPE
  time: number
  value: number
  valueChange: number
  index: number
  tripId: string
  tripCreationCost: number
}

// Used to draw baseline in the graph
export type TripEventBaseline = TripEventShared & {
  eventType: TRIP_EVENT_TYPE.BASELINE
  meta: undefined
}

// VISIT => meta is SanityOutcome
export type TripEventVisit = TripEventShared & {
  eventType: TRIP_EVENT_TYPE.VISIT
  meta: SanityOutcome
}

// DEATH => meta is SanityOutcome
export type TripEventDeath = TripEventShared & {
  eventType: TRIP_EVENT_TYPE.DEATH
  meta: SanityOutcome
}

// CREATION => meta is SanityTrip
export type TripEventCreation = TripEventShared & {
  eventType: TRIP_EVENT_TYPE.CREATION
  meta: SanityTrip
}

// LIQUIDATION => meta is SanityTrip
export type TripEventLiquidation = TripEventShared & {
  eventType: TRIP_EVENT_TYPE.LIQUIDATION
  meta: SanityTrip
}

// DEPLETION => meta is SanityTrip
export type TripEventDepletion = TripEventShared & {
  eventType: TRIP_EVENT_TYPE.DEPLETED
  meta: SanityTrip
}

export type TripEvent =
  | TripEventBaseline
  | TripEventVisit
  | TripEventDeath
  | TripEventCreation
  | TripEventLiquidation
  | TripEventDepletion
