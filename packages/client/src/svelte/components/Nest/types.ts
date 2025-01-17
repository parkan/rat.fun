export type TraitChange = {
  type: "add" | "remove",
  id?: string,
  name?: string
}

export type ServerReturnValue = {
    log: string[]
    traitChanges: TraitChange[]
    statChanges: {
      [key: string]: number
    }
  }