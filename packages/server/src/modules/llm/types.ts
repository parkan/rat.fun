export type TraitChange = {
    type: "add" | "remove",
    name: string,
    value: number,
    id?: string // Only set if type is "remove"
}

export type ItemChange = {
    type: "add" | "remove",
    name: string,
    value: number,
    id?: string // Only set if type is "remove"
}

export type LogEntry = {
    timestamp: string,
    event: string
}

export type OutcomeReturnValue = {
    statChanges: {
        health: number
    },
    traitChanges: TraitChange[],
    itemChanges: ItemChange[],
    balanceTransfer: number
}

export type EventsReturnValue = LogEntry[];