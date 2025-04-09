import { Rat, Room } from "@routes/room/enter/types";

export function createMessage(rat: Rat, room: Room) {
    const topic = 'room__outcome'
    const message = `${rat.name} entered room "${room.name}"`
    return {
        topic,
        message
    }
}