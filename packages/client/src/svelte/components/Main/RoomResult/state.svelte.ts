import { writable } from "svelte/store"

export const frozenRoom = writable<Room | null>(null)
export const frozenRat = writable<Rat | null >(null)

export function freezeObjects(rat: Rat, room: Room) {
  console.log("freezing objects", rat, room)
  frozenRat.set(structuredClone(rat))
  frozenRoom.set(structuredClone(room))
}

// ------------------------------------------------------------
// Health
// ------------------------------------------------------------

export function changeHealth(healthChange: number) {
  frozenRat.update(rat => {
    if (!rat) return null
    rat.health = Number(rat.health) + healthChange
    return rat
  })
  
  // Inverse rat health change to get room balance change
  frozenRoom.update(room => {
    if (!room) return null
    room.balance = Number(room.balance) - healthChange
    return room
  })
}

// ------------------------------------------------------------
// Balance
// ------------------------------------------------------------

export function changeBalance(balanceChange: number) {
  frozenRat.update(rat => {
    if (!rat) return null
    rat.balance = Number(rat.balance) + balanceChange
    return rat
  })

  // Inverse rat balance change to get room balance change
  frozenRoom.update(room => {
    if (!room) return null
    room.balance = Number(room.balance) - balanceChange
    return room
  })
}

// ------------------------------------------------------------
// Inventory
// ------------------------------------------------------------

export function addItem(itemId: string, itemValue: number) {
  frozenRat.update(rat => {
    if (!rat) return null
    rat.inventory.push(itemId)
    return rat
  })

  // Items always have positive value
  frozenRoom.update(room => {
    if (!room) return null
    room.balance = Number(room.balance) - itemValue
    return room
  })
}

export function removeItem(itemId: string, itemValue: number) {
  frozenRat.update(rat => {
    if (!rat) return null
    rat.inventory = rat.inventory.filter(i => i !== itemId)
    return rat
  })

  // Items always have positive value
  frozenRoom.update(room => {
    if (!room) return null
    room.balance = Number(room.balance) + itemValue
    return room
  })
}

// ------------------------------------------------------------
// Traits
// ------------------------------------------------------------

export function addTrait(traitId: string) {
  frozenRat.update(rat => {
    if (!rat) return null
    rat.traits.push(traitId)
    return rat
  })
}

export function removeTrait(traitId: string) {
  frozenRat.update(rat => {
    if (!rat) return null
    rat.traits = rat.traits.filter(t => t !== traitId)
    return rat
  })
}
