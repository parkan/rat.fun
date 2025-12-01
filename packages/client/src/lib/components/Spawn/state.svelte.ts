import { errorHandler } from "$lib/modules/error-handling"
import { InvalidStateTransitionError } from "$lib/modules/error-handling/errors"

/**
 * ========================================
 *  Spawn/state.svelte.ts
 * ========================================
 * This module keeps track of the state of the spawn flow.
 */

/*
 * ─────────────────────────────────────────────
 * Spawn Flow State
 * ─────────────────────────────────────────────
 * The spawn flow is modeled as a state machine.
 */

export enum SPAWN_STATE {
  INIT = "INIT",
  CONNECT_WALLET = "CONNECT_WALLET",
  INTRODUCTION = "INTRODUCTION",
  ALLOWANCE = "ALLOWANCE",
  ALLOWANCE__LOADING = "ALLOWANCE__LOADING",
  SESSION_AND_SPAWN = "SESSION_AND_SPAWN",
  SESSION_AND_SPAWN__LOADING = "SESSION_AND_SPAWN__LOADING",
  SESSION = "SESSION",
  SESSION__LOADING = "SESSION__LOADING",
  SPAWN = "SPAWN",
  SPAWN__LOADING = "SPAWN__LOADING",
  EXIT_FLOW = "EXIT_FLOW",
  DONE = "DONE",
  ERROR = "ERROR"
}

// Local state
let spawnStateValue = $state<SPAWN_STATE>(SPAWN_STATE.INIT)
let playerName = $state<string>("")
let onExitFlowCallback: (() => void) | null = null

/**
 * Defines valid state transitions between spawn states
 */
const VALID_TRANSITIONS: Record<SPAWN_STATE, SPAWN_STATE[]> = {
  [SPAWN_STATE.INIT]: [
    SPAWN_STATE.CONNECT_WALLET, // No wallet, new user flow
    SPAWN_STATE.ALLOWANCE, // All setup but no allowance
    SPAWN_STATE.SESSION, // Wallet but no session
    SPAWN_STATE.SPAWN, // Wallet and session, but not spawned
    SPAWN_STATE.EXIT_FLOW, // All setup, go to game
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.CONNECT_WALLET]: [
    SPAWN_STATE.SESSION, // No session, but is spawned
    SPAWN_STATE.SPAWN, // Session but is not spawned
    SPAWN_STATE.INTRODUCTION, // Neither session nor spawned, new user flow
    SPAWN_STATE.EXIT_FLOW, // Everything setup, go to game
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.INTRODUCTION]: [SPAWN_STATE.ALLOWANCE, SPAWN_STATE.ERROR],
  [SPAWN_STATE.ALLOWANCE]: [SPAWN_STATE.ALLOWANCE__LOADING, SPAWN_STATE.ERROR],
  [SPAWN_STATE.ALLOWANCE__LOADING]: [
    SPAWN_STATE.ALLOWANCE, // Return on error
    SPAWN_STATE.SPAWN,
    SPAWN_STATE.SESSION,
    SPAWN_STATE.SESSION_AND_SPAWN,
    SPAWN_STATE.EXIT_FLOW,
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.SESSION]: [SPAWN_STATE.SESSION__LOADING, SPAWN_STATE.ERROR],
  [SPAWN_STATE.SESSION__LOADING]: [
    SPAWN_STATE.SESSION, // Return on error
    SPAWN_STATE.SPAWN, // Session setup, but not spawned
    SPAWN_STATE.EXIT_FLOW, // Session setup and already spawned
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.SPAWN]: [SPAWN_STATE.SPAWN__LOADING, SPAWN_STATE.ERROR],
  [SPAWN_STATE.SPAWN__LOADING]: [
    SPAWN_STATE.SPAWN, // Return on error
    SPAWN_STATE.DONE,
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.SESSION_AND_SPAWN]: [SPAWN_STATE.SESSION_AND_SPAWN__LOADING, SPAWN_STATE.ERROR],
  [SPAWN_STATE.SESSION_AND_SPAWN__LOADING]: [
    SPAWN_STATE.SESSION_AND_SPAWN, // Return on error
    SPAWN_STATE.DONE,
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.DONE]: [SPAWN_STATE.EXIT_FLOW],
  [SPAWN_STATE.EXIT_FLOW]: [],
  [SPAWN_STATE.ERROR]: []
}

const setSpawnState = (state: SPAWN_STATE) => {
  spawnStateValue = state
}

const resetSpawnState = () => {
  spawnStateValue = SPAWN_STATE.INIT
  playerName = ""
}

const transitionTo = (newState: SPAWN_STATE) => {
  if (newState === spawnStateValue) return
  const validTransitions = VALID_TRANSITIONS[spawnStateValue]
  if (!validTransitions.includes(newState)) {
    const err = new InvalidStateTransitionError(
      undefined,
      undefined,
      `Invalid state transition from ${spawnStateValue} to ${newState}`
    )
    errorHandler(err)
    return
  }
  console.log(`[Spawn State] ${spawnStateValue} → ${newState}`)
  setSpawnState(newState)

  // Trigger callback when exiting the flow
  if (newState === SPAWN_STATE.EXIT_FLOW && onExitFlowCallback) {
    onExitFlowCallback()
  }
}

const setPlayerName = (name: string) => {
  playerName = name
}

const setOnExitFlow = (callback: () => void) => {
  onExitFlowCallback = callback
}

// Export singleton instance instead of factory function
export const spawnState = {
  state: {
    reset: resetSpawnState,
    set: setSpawnState,
    transitionTo,
    setOnExitFlow,
    get current() {
      return spawnStateValue
    }
  },
  data: {
    setPlayerName,
    get playerName() {
      return playerName
    }
  }
}
