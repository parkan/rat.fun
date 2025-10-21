/**
 * Calculate the trip factor based on the old trip factor, the new trip value, and if the rat died
 * @param oldTripFactor - The old trip factor
 * @param tripValueChange - Change in trip value
 * @param ratDied - If the rat died
 * @returns The new trip factor
 */
export const calculateTripFactor = (
  oldTripFactor: number,
  tripValueChange: number,
  ratDied: boolean
): number => {
  // Start with the old trip factor as the base
  let newTripFactor = oldTripFactor

  // If rat died, it's very bad - significant penalty
  if (ratDied) {
    newTripFactor -= 0.3
  }

  // Trip value change impact
  // newTripValue > 0 means trip gained money (bad for players)
  // newTripValue < 0 means trip lost money (good for players)
  if (tripValueChange > 0) {
    // Trip value went up - bad for players
    // Scale penalty based on magnitude, capped at 0.2
    const penalty = Math.min(tripValueChange / 1000, 0.2)
    newTripFactor -= penalty
  } else if (tripValueChange < 0) {
    // Trip value went down - good for players
    // Scale reward based on magnitude, capped at 0.2
    const reward = Math.min(Math.abs(tripValueChange) / 1000, 0.2)
    newTripFactor += reward
  }

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, newTripFactor))
}
