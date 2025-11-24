import { errorHandler } from "$lib/modules/error-handling"
import { InvalidStateTransitionError } from "$lib/modules/error-handling/errors"

/**
 * ========================================
 *  Swap/state.svelte.ts
 * ========================================
 * This module keeps track of the state of the swap flow.
 *
 */

export enum SWAP_STATE {
  INIT = "INIT",
  COUNTRY_CODE = "COUNTRY_CODE",
  PERMIT2_ALLOW_MAX = "PERMIT2_ALLOW_MAX",
  SIGN_PERMIT2 = "SIGN_PERMIT2",
  EXECUTE_SWAP = "EXECUTE_SWAP",
  SWAP_COMPLETE = "SWAP_COMPLETE",
  WALLET_LIMIT_REACHED = "WALLET_LIMIT_REACHED",
  ERROR = "ERROR"
}

// Local state
let swapStateValue = $state<SWAP_STATE>(SWAP_STATE.INIT)

/**
 * Defines valid state transitions between swap states
 * Maps each state to an array of valid states it can transition to
 */
const VALID_TRANSITIONS: Record<SWAP_STATE, SWAP_STATE[]> = {
  [SWAP_STATE.INIT]: [
    SWAP_STATE.COUNTRY_CODE,
    SWAP_STATE.PERMIT2_ALLOW_MAX,
    SWAP_STATE.WALLET_LIMIT_REACHED,
    SWAP_STATE.ERROR
  ],
  [SWAP_STATE.COUNTRY_CODE]: [
    SWAP_STATE.PERMIT2_ALLOW_MAX,
    SWAP_STATE.SIGN_PERMIT2,
    SWAP_STATE.ERROR
  ],
  [SWAP_STATE.PERMIT2_ALLOW_MAX]: [SWAP_STATE.SIGN_PERMIT2, SWAP_STATE.ERROR],
  [SWAP_STATE.SIGN_PERMIT2]: [SWAP_STATE.EXECUTE_SWAP, SWAP_STATE.ERROR],
  [SWAP_STATE.EXECUTE_SWAP]: [SWAP_STATE.SWAP_COMPLETE, SWAP_STATE.ERROR],
  [SWAP_STATE.SWAP_COMPLETE]: [],
  [SWAP_STATE.WALLET_LIMIT_REACHED]: [],
  [SWAP_STATE.ERROR]: []
}

const setState = (state: SWAP_STATE) => {
  swapStateValue = state
}

const resetState = () => {
  swapStateValue = SWAP_STATE.INIT
}

const transitionTo = (newState: SWAP_STATE) => {
  if (newState === swapStateValue) return
  const validTransitions = VALID_TRANSITIONS[swapStateValue]
  if (!validTransitions.includes(newState)) {
    const err = new InvalidStateTransitionError(
      undefined,
      undefined,
      `Invalid state transition from ${swapStateValue} to ${newState}`
    )
    errorHandler(err)
    return
  }
  setState(newState)
}

// Export singleton instance
export const swapState = {
  state: {
    reset: resetState,
    set: setState,
    transitionTo,
    get current() {
      return swapStateValue
    }
  }
}
