import { Rat, Trip, Player, GamePercentagesConfig } from "@modules/types"
import {
  RatOwnershipError,
  RatDeadError,
  TripBalanceError,
  RatValueError,
  ChallengeTripExpiredError
} from "@modules/error-handling/errors"
import { getTripMinRatValueToEnter } from "@modules/mud/value"

// Challenge active period in blocks (24h at 2s/block on Base)
// TODO: Read from chain after deployment
const CHALLENGE_ACTIVE_PERIOD_BLOCKS = 43200

export function validateInputData(
  player: Player,
  rat: Rat,
  trip: Trip,
  gamePercentagesConfig: GamePercentagesConfig,
  currentBlockNumber?: bigint
) {
  // Check that sender owns the rat
  if (rat.owner !== player.id) {
    throw new RatOwnershipError()
  }

  // Check that the rat is alive
  if (rat.dead) {
    throw new RatDeadError()
  }

  // Check challenge trip is still in active period
  if (trip.challengeTrip && currentBlockNumber !== undefined && trip.creationBlock !== undefined) {
    const expirationBlock = BigInt(trip.creationBlock) + BigInt(CHALLENGE_ACTIVE_PERIOD_BLOCKS)
    if (currentBlockNumber > expirationBlock) {
      throw new ChallengeTripExpiredError()
    }
  }

  // Check that the rat has enough value to enter the trip
  const minValueToEnter = getTripMinRatValueToEnter(
    trip.tripCreationCost,
    gamePercentagesConfig,
    trip.challengeTrip,
    trip.fixedMinValueToEnter
  )
  if (rat.totalValue < minValueToEnter) {
    throw new RatValueError()
  }

  // Check that trip balance is positive
  if (trip.balance == 0) {
    throw new TripBalanceError()
  }
}
