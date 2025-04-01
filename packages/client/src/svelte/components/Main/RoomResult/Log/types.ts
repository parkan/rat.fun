import { LogEntry, HealthChange,  BalanceTransfer, TraitChange, ItemChange } from "@components/Main/RoomResult/types"

export type MergedLogEntry = LogEntry & {
  healthChange?: HealthChange
  balanceTransfer?: BalanceTransfer
  traitChanges?: TraitChange[]
  itemChanges?: ItemChange[]
}