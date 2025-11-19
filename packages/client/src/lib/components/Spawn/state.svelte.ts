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
  WELCOME_SCREEN = "WELCOME_SCREEN",
  CONNECT_WALLET = "CONNECT_WALLET",
  SESSION_SETUP = "SESSION_SETUP",
  SETTING_UP_SESSION = "SETTING_UP_SESSION",
  INTRODUCTION = "INTRODUCTION",
  SPAWN_FORM = "SPAWN_FORM",
  SPAWNING = "SPAWNING",
  DONE = "DONE",
  ERROR = "ERROR"
}

// Local state
let spawnStateValue = $state<SPAWN_STATE>(SPAWN_STATE.INIT)
let playerName = $state<string>("")

/**
 * Defines valid state transitions between spawn states
 */
const VALID_TRANSITIONS: Record<SPAWN_STATE, SPAWN_STATE[]> = {
  [SPAWN_STATE.INIT]: [
    SPAWN_STATE.WELCOME_SCREEN,
    SPAWN_STATE.SESSION_SETUP,
    SPAWN_STATE.INTRODUCTION,
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.WELCOME_SCREEN]: [SPAWN_STATE.CONNECT_WALLET, SPAWN_STATE.ERROR],
  [SPAWN_STATE.CONNECT_WALLET]: [
    SPAWN_STATE.SESSION_SETUP,
    SPAWN_STATE.INTRODUCTION,
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.SESSION_SETUP]: [SPAWN_STATE.SETTING_UP_SESSION, SPAWN_STATE.ERROR],
  [SPAWN_STATE.SETTING_UP_SESSION]: [
    SPAWN_STATE.INTRODUCTION,
    SPAWN_STATE.SESSION_SETUP,
    SPAWN_STATE.ERROR
  ],
  [SPAWN_STATE.INTRODUCTION]: [SPAWN_STATE.SPAWN_FORM, SPAWN_STATE.ERROR],
  [SPAWN_STATE.SPAWN_FORM]: [SPAWN_STATE.SPAWNING, SPAWN_STATE.ERROR],
  [SPAWN_STATE.SPAWNING]: [SPAWN_STATE.DONE, SPAWN_STATE.SPAWN_FORM, SPAWN_STATE.ERROR],
  [SPAWN_STATE.DONE]: [],
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
}

const setPlayerName = (name: string) => {
  playerName = name
}

// Export singleton instance instead of factory function
export const spawnState = {
  state: {
    reset: resetSpawnState,
    set: setSpawnState,
    transitionTo,
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
