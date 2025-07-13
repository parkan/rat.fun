import { Rat, Room, Player } from "@modules/types"
import {
  RatOwnershipError,
  RatDeadError,
  LevelMismatchError,
  RoomBalanceError
} from "@modules/error-handling/errors"

export function validateInputData(player: Player, rat: Rat, room: Room) {
  // Check that sender owns the rat
  if (rat.owner !== player.id) {
    throw new RatOwnershipError()
  }

  // Check that the rat is alive
  if (rat.dead) {
    throw new RatDeadError()
  }

  // Check that rat and room level are the same
  if (rat.level !== room.level) {
    throw new LevelMismatchError()
  }

  // Check that room balance is positive
  if (room.balance == 0) {
    throw new RoomBalanceError()
  }
}
