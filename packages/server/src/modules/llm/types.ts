export type EventsReturnValue = {
    log: string[]
};

export type TraitChange = {
    type: "add" | "remove",
    id?: string,
    name?: string
}

export type OutcomeReturnValue = {
    traitChanges: TraitChange[],
    statChanges: {
        health: number,
        level: number
    }
}