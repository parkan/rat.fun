/**
 * Calculate the trip factor based on the old trip factor, the new trip value, and if the rat died
 * @param oldTripFactor - The old trip factor
 * @param newTripValue - The new trip value
 * @param ratDied - If the rat died
 * @returns The new trip factor
 */
export const calculateTripFactor = (
  oldTripFactor: number,
  newTripValue: number,
  ratDied: boolean
): number => {
  // Start with base score of 0.5
  let riskRewardScore = 0.5

  // If rat died, it's very bad - significant penalty
  if (ratDied) {
    riskRewardScore -= 0.3
  }

  // Trip value change impact
  // newTripValue > 0 means trip gained money (bad for players)
  // newTripValue < 0 means trip lost money (good for players)
  if (newTripValue > 0) {
    // Trip value went up - bad for players
    // Scale penalty based on magnitude, capped at 0.2
    const penalty = Math.min(newTripValue / 1000, 0.2)
    riskRewardScore -= penalty
  } else if (newTripValue < 0) {
    // Trip value went down - good for players
    // Scale reward based on magnitude, capped at 0.2
    const reward = Math.min(Math.abs(newTripValue) / 1000, 0.2)
    riskRewardScore += reward
  }

  // Apply weighted average with previous factor (70% new, 30% old)
  // This creates momentum while allowing for recent changes
  const finalScore = riskRewardScore * 0.7 + oldTripFactor * 0.3

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, finalScore))
}
