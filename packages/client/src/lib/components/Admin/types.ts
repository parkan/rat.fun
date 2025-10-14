import type { Outcome as SanityOutcome, Trip as SanityTrip } from "@sanity-types"

export type PendingTrip = { prompt: string; cost: number } | null

export enum TRIP_EVENT_TYPE {
  VISIT = "trip_visit",
  DEATH = "trip_death",
  CREATION = "trip_created",
  LIQUIDATION = "trip_liquidated"
}

export type TripEvent = {
  time: number
  value: number
  valueChange?: number
  index: number
  tripId: string
  tripCreationCost: number
  eventType?: TRIP_EVENT_TYPE
  meta?: Partial<SanityOutcome> | Partial<SanityTrip>
}
