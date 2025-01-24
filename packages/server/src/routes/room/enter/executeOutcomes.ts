import { OutcomeReturnValue } from "@modules/llm/types";
import type { SystemCalls } from "@modules/mud/createSystemCalls";

export async function changeStats(systemCalls: SystemCalls, outcome: OutcomeReturnValue, ratId: string, roomId: string) {
    Object.entries(outcome.statChanges).forEach(async ([statName, change]) => {
        if (change === 0) return;
        if(statName === "health") {
            if(change > 0) {
                systemCalls.increaseHealth(ratId, change);
                // For each point of health added to rat, reduce room blance by one credit
                systemCalls.decreaseBalance(roomId, change);
            } else {
                systemCalls.decreaseHealth(ratId, Math.abs(change));
                // For each point of health removed from rat, increase room balance by one credit
                systemCalls.increaseBalance(roomId, Math.abs(change));
            }
        }
    });
}

export async function changeTraits(systemCalls: SystemCalls, outcome: OutcomeReturnValue, ratId: string, roomId: string) {
    for( let i = 0; i < outcome.traitChanges.length; i++) {
        const change = outcome.traitChanges[i];
        if(change.type === "add") {
            // Add trait to rat
            systemCalls.addTraitToRat(ratId, change.name ?? "", change.value);
            // Change room balance
            if(change.value > 0) {
                // If the trait has a positive value, decrease the room balance
                systemCalls.decreaseBalance(roomId, Math.abs(change.value));
            } else {
                // If the trait has a negative value, increase the room balance
                systemCalls.increaseBalance(roomId, Math.abs(change.value));
            }
        } else if(change.type === "remove") {
            // Remove trait from rat
            systemCalls.removeTraitFromRat(ratId, change.id ?? "");
            if(change.value > 0) {
                // If the trait has a positive value, increase the room balance
                systemCalls.increaseBalance(roomId, Math.abs(change.value));
            } else {
                // If the trait has a negative value, decrease the room balance
                systemCalls.decreaseBalance(roomId, Math.abs(change.value));
            }
        }
    }
}

export async function changeItems(systemCalls: SystemCalls, outcome: OutcomeReturnValue, ratId: string, roomId: string) {
    for( let i = 0; i < outcome.itemChanges.length; i++) {
        const change = outcome.itemChanges[i];
        if(change.type === "add") {
            // Add the item to the rat's load out
            systemCalls.addItemToLoadOut(ratId, change.name ?? "", change.value);
            // Change room balance
            if(change.value > 0) {
                // If the trait has a positive value, decrease the room balance
                systemCalls.decreaseBalance(roomId, Math.abs(change.value));
            } else {
                // If the trait has a negative value, increase the room balance
                systemCalls.increaseBalance(roomId, Math.abs(change.value));
            }
        } else if(change.type === "remove") {
            // Remove item from rat's load out
            systemCalls.removeItemFromLoadOut(ratId, change.id ?? "");
            if(change.value > 0) {
                // If the trait has a positive value, increase the room balance
                systemCalls.increaseBalance(roomId, Math.abs(change.value));
            } else {
                // If the trait has a negative value, decrease the room balance
                systemCalls.decreaseBalance(roomId, Math.abs(change.value));
            }
        }
    }
}

export async function transferBalance(systemCalls: SystemCalls, outcome: OutcomeReturnValue, ratId: string, roomId: string) {
    if(!outcome.balanceTransfer) return;
    const change = outcome.balanceTransfer;
    if(change > 0) {
        // If positive change: increase rat balance, decrease room balance
        systemCalls.increaseBalance(ratId, change);
        systemCalls.decreaseBalance(roomId, change);
    } else {
        // If negative change: decrease rat balance, increase room balance
        systemCalls.decreaseBalance(ratId, Math.abs(change));
        systemCalls.increaseBalance(roomId, Math.abs(change));
    }
}