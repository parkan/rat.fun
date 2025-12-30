/**
 * Query Server Client
 *
 * Client functions for fetching data from the query-server API.
 */

import { ENVIRONMENT } from "@ratfun/common/basic-network"
import { getQueryServerUrl } from "$lib/modules/chain-sync/hydrateFromServer"
import { createLogger } from "$lib/modules/logger"
import type {
  RatLeaderboardEntry,
  TripLeaderboardEntry,
  LeaderboardResponse,
  ChallengeWinnerEntry,
  ChallengeResponse
} from "query-server/types"

const logger = createLogger("queryServer")

// Re-export types for convenience
export type {
  RatLeaderboardEntry,
  TripLeaderboardEntry,
  LeaderboardResponse,
  ChallengeWinnerEntry,
  ChallengeResponse
}

// Challenge winners response type
export type ChallengeWinnersResponse = {
  blockNumber: string
  count: number
  entries: ChallengeWinnerEntry[]
}

/**
 * Fetch active rats leaderboard (by total value: balance + inventory)
 */
export async function fetchActiveRatsLeaderboard(
  environment: ENVIRONMENT
): Promise<LeaderboardResponse<RatLeaderboardEntry> | null> {
  const baseUrl = getQueryServerUrl(environment)
  if (!baseUrl) return null

  try {
    const url = new URL("/api/leaderboard/active-rats", baseUrl)

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.warn("Failed:", error)
    return null
  }
}

/**
 * Fetch cashed out rats leaderboard (by liquidation value)
 */
export async function fetchCashedOutRatsLeaderboard(
  environment: ENVIRONMENT
): Promise<LeaderboardResponse<RatLeaderboardEntry> | null> {
  const baseUrl = getQueryServerUrl(environment)
  if (!baseUrl) return null

  try {
    const url = new URL("/api/leaderboard/cashed-out-rats", baseUrl)

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.warn("Failed:", error)
    return null
  }
}

/**
 * Fetch active trips leaderboard (by balance)
 */
export async function fetchActiveTripsLeaderboard(
  environment: ENVIRONMENT
): Promise<LeaderboardResponse<TripLeaderboardEntry> | null> {
  const baseUrl = getQueryServerUrl(environment)
  if (!baseUrl) return null

  try {
    const url = new URL("/api/leaderboard/active-trips", baseUrl)

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.warn("Failed:", error)
    return null
  }
}

/**
 * Fetch cashed out trips leaderboard (by liquidation value)
 */
export async function fetchCashedOutTripsLeaderboard(
  environment: ENVIRONMENT
): Promise<LeaderboardResponse<TripLeaderboardEntry> | null> {
  const baseUrl = getQueryServerUrl(environment)
  if (!baseUrl) return null

  try {
    const url = new URL("/api/leaderboard/cashed-out-trips", baseUrl)

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.warn("Failed:", error)
    return null
  }
}

/**
 * Fetch challenge winners leaderboard
 */
export async function fetchChallengeWinners(
  environment: ENVIRONMENT
): Promise<ChallengeWinnersResponse | null> {
  const baseUrl = getQueryServerUrl(environment)
  if (!baseUrl) return null

  try {
    const url = new URL("/api/leaderboard/challenge-winners", baseUrl)

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.warn("Failed:", error)
    return null
  }
}

// Active challenge response type
export type ActiveChallengeResponse = {
  active: boolean
  challenge: ChallengeResponse | null
}

/**
 * Fetch active challenge trip
 */
export async function fetchActiveChallenge(
  environment: ENVIRONMENT
): Promise<ActiveChallengeResponse | null> {
  const baseUrl = getQueryServerUrl(environment)
  if (!baseUrl) return null

  try {
    const url = new URL("/api/active-challenge", baseUrl)

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.warn("Failed:", error)
    return null
  }
}

// Last completed challenge response type
export type LastCompletedChallengeResponse = {
  found: boolean
  challenge: ChallengeResponse | null
}

/**
 * Fetch last completed (won) challenge trip
 */
export async function fetchLastCompletedChallenge(
  environment: ENVIRONMENT
): Promise<LastCompletedChallengeResponse | null> {
  const baseUrl = getQueryServerUrl(environment)
  if (!baseUrl) return null

  try {
    const url = new URL("/api/last-completed-challenge", baseUrl)

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.warn("Failed:", error)
    return null
  }
}
