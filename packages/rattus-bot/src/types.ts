import type { Hex } from "viem"

export interface Config {
  privateKey: Hex
  anthropicApiKey: string
  chainId: number
  serverUrl: string
  tripSelector: "claude" | "heuristic"
  autoRespawn: boolean
  ratName: string
  worldAddress?: string
  rpcHttpUrl?: string
}

export interface Trip {
  id: string
  prompt: string
  balance: number
  tripCreationCost: number
  owner: string
}

export interface Rat {
  id: string
  name: string
  balance: number
  dead: boolean
  owner: string
  tripCount: number
  inventory: string[]
}

export interface Player {
  id: string
  name: string
  balance: number
  currentRat: string | null
}

export interface GameConfig {
  ratCreationCost: number
  adminId: string
}

export interface GamePercentagesConfig {
  maxValuePerWin: number
  minRatValueToEnter: number
}

export interface EnterTripRequestBody {
  tripId: string
  ratId: string
}

export interface SignedRequestInfo {
  timestamp: number
  nonce: number
  calledFrom: Hex | null
}

export interface SignedRequest<T> {
  data: T
  info: SignedRequestInfo
  signature: Hex
}

export interface LogEntry {
  type: string
  text: string
}

export interface EnterTripReturnValue {
  id: Hex
  log: LogEntry[]
  itemChanges: unknown[]
  balanceTransfers: unknown[]
  debuggingInfo: unknown
  ratDead: boolean
  tripDepleted: boolean
}
