import type { Trip } from "../../types"

/**
 * Simple heuristic-based trip selection
 * Selects the trip with the highest balance
 */
export function selectTripHeuristic(trips: Trip[]): Trip | null {
  if (trips.length === 0) return null

  // Sort by balance descending
  const sorted = [...trips].sort((a, b) => b.balance - a.balance)
  return sorted[0]
}

/**
 * Select a random trip
 */
export function selectTripRandom(trips: Trip[]): Trip | null {
  if (trips.length === 0) return null

  const randomIndex = Math.floor(Math.random() * trips.length)
  return trips[randomIndex]
}
