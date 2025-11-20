import type { ActivePrompts, Prompt, Outcome as OutcomeDoc } from "@sanity-private-cms-types"
import type { Rat, Trip, Player, DebuggingInfo } from "@modules/types"
import type { CorrectionReturnValue, OutcomeReturnValue } from "@modules/types"
import { loadDataPrivateSanity, privateSanityClient } from "@modules/cms/private/sanity"
import { queries } from "@modules/cms/private/groq"
import { CMSError, CMSAPIError, CMSDataError } from "@modules/error-handling/errors"
import { createFullOutcomeDocument } from "@modules/cms/shared"

// - - - - - -
// READ
// - - - - - -

type ExpandedActivePrompts = ActivePrompts & {
  activeEventPrompt: Prompt
  activeCorrectionPrompt: Prompt
}

export const getSystemPrompts = async () => {
  try {
    const activePrompts = (await loadDataPrivateSanity(
      queries.activePrompts,
      {}
    )) as ExpandedActivePrompts

    if (
      !activePrompts ||
      !activePrompts.activeEventPrompt ||
      !activePrompts.activeCorrectionPrompt
    ) {
      throw new CMSDataError("Missing required prompt data", activePrompts)
    }

    return {
      combinedSystemPrompt: combineSystemPrompts(activePrompts.activeEventPrompt),
      correctionSystemPrompt: combineSystemPrompts(activePrompts.activeCorrectionPrompt)
    }
  } catch (error) {
    // If it's already one of our custom errors, rethrow it
    if (error instanceof CMSError) {
      throw error
    }

    // Otherwise, wrap it in our custom error
    throw new CMSAPIError(
      `Error fetching system prompts: ${error instanceof Error ? error.message : String(error)}`,
      error
    )
  }
}

// - - - - - -
// WRITE
// - - - - - -

/**
 * Write outcome to private CMS with full debugging information.
 * Stores sensitive data including debugging info and log output.
 * @param outcomeId - The pre-generated outcome ID for tracking
 * @param worldAddress - The world address
 * @param player - The player who performed the trip
 * @param trip - The trip state BEFORE the visit (old values)
 * @param rat - The rat state BEFORE the visit (old values)
 * @param newTripValue - The trip value AFTER the visit
 * @param tripValueChange - Change in trip value
 * @param newRatValue - The rat value AFTER the visit
 * @param ratValueChange - Change in rat value
 * @param newRatBalance - The rat balance/health AFTER the visit
 * @param events - The corrected event log
 * @param outcome - The validated outcome
 * @param mainProcessingTime - Processing time in ms
 * @param debuggingInfo - Debug information from LLM
 * @param logOutput - Accumulated logs from the trip processing
 */
export async function writeOutcomeToPrivateCMS(
  outcomeId: string,
  worldAddress: string,
  player: Player,
  trip: Trip,
  rat: Rat,
  newTripValue: number,
  tripValueChange: number,
  newRatValue: number,
  ratValueChange: number,
  newRatBalance: number,
  events: CorrectionReturnValue,
  outcome: OutcomeReturnValue,
  mainProcessingTime: number,
  debuggingInfo: DebuggingInfo,
  logOutput?: string
): Promise<OutcomeDoc> {
  try {
    const fullOutcomeDoc = createFullOutcomeDocument(
      outcomeId,
      worldAddress,
      player,
      trip,
      rat,
      newTripValue,
      tripValueChange,
      newRatValue,
      ratValueChange,
      newRatBalance,
      events,
      outcome,
      mainProcessingTime,
      debuggingInfo,
      logOutput
    )

    // Create the outcome document in private Sanity
    const outcomeDoc = (await privateSanityClient.create(fullOutcomeDoc)) as OutcomeDoc

    return outcomeDoc
  } catch (error) {
    // If it's already one of our custom errors, rethrow it
    if (error instanceof CMSError) {
      throw error
    }

    // Otherwise, wrap it in our custom error
    throw new CMSAPIError(
      `Error writing outcome to private CMS: ${error instanceof Error ? error.message : String(error)}`,
      error
    )
  }
}

// - - - - - -
// HELPERS
// - - - - - -

function combineSystemPrompts(doc: Prompt) {
  return `Return format: ${doc.returnFormat?.code ?? ""} // ${doc.prompt ?? ""}`
}
