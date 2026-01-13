import { Player, GameConfig } from "@modules/types"
import {
  AuthorizationError,
  InsufficientBalanceError,
  InvalidPromptError,
  InvalidTripCreationCostError,
  ValidationError
} from "@modules/error-handling/errors"
import { MIN_TRIP_CREATION_COST } from "../../../config"

export function validateInputData(
  gameConfig: GameConfig,
  player: Player,
  tripPrompt: string,
  tripCreationCost: number
) {
  // Check if player has master key
  if (!player.masterKey) {
    throw new AuthorizationError()
  }

  // Check if trip creation cost is greater than minimum
  if (tripCreationCost < MIN_TRIP_CREATION_COST) {
    throw new InvalidTripCreationCostError()
  }

  // Check if player has enough balance to create a trip
  if (player.balance < tripCreationCost) {
    throw new InsufficientBalanceError("Not enough balance to create trip.")
  }

  // Check that the prompt is not empty and prompt is less than limit
  if (tripPrompt.length < 1 || tripPrompt.length > gameConfig.maxTripPromptLength) {
    throw new InvalidPromptError(
      `Trip prompt must be between 1 and ${gameConfig.maxTripPromptLength} characters.`
    )
  }
}

// Challenge trip fixed parameters
export const CHALLENGE_FIXED_MIN_VALUE_TO_ENTER = 100
export const CHALLENGE_MAX_WIN_PERCENTAGE = 100

/**
 * Validate challenge trip parameters
 * @param isChallengeTrip - Whether this is a challenge trip
 * @param tripCreationCost - The trip creation cost
 * @param minChallengeCreationCost - Minimum cost to create a challenge trip (read from chain)
 */
export function validateChallengeTripParams(
  isChallengeTrip: boolean | undefined,
  tripCreationCost: number,
  minChallengeCreationCost: number
) {
  if (!isChallengeTrip) {
    return
  }

  // Enforce minimum challenge trip creation cost
  if (tripCreationCost < minChallengeCreationCost) {
    throw new ValidationError(
      "CHALLENGE_TRIP_PARAM_ERROR",
      "Validation failed",
      `Challenge trip creation cost must be at least ${minChallengeCreationCost}`
    )
  }
  // Note: fixedMinValueToEnter and overrideMaxValuePerWinPercentage are now fixed at 100
  // and enforced by the contract
}
