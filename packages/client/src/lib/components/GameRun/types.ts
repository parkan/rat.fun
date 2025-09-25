import { Hex } from "viem"
import { LogEntry, BalanceTransfer, ItemChange } from "@server/modules/types"

export type TempItem = {
  name: string
  value: number
}

export type FrozenRat = Rat & {
  inventory: Array<string | TempItem>
  image: string
}

export type FrozenRoom = Room & {
  id: Hex
}

export type MergedLogEntry = LogEntry & {
  balanceTransfer?: BalanceTransfer
  itemChanges?: ItemChange[]
}

export type OutcomeDataStringMap = {
  type: string
  action: string
  value: string
  name?: string
  id?: string
}

// export type RoomEntryState = {
//   state: TRIP_STATE
//   valid: boolean
//   processing: boolean
//   result: EnterRoomReturnValue | null
//   error: boolean
//   errorMessage?: string
//   frozenRat: FrozenRat | null
//   frozenRoom: FrozenRoom | null
// }
