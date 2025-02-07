import { ENTITY_TYPE } from "./enums"

export function filterByEntitytype(
  entities: Entities,
  entityType: ENTITY_TYPE
): Entities {
  return Object.fromEntries(
    Object.entries(entities).filter(
      ([, entity]) => entity.entityType === entityType
    )
  )
}

export function filterByLevel(rooms: Rooms, level: string): Rooms {
  return Object.fromEntries(
    Object.entries(rooms).filter(
      ([, room]) => room.level === level
    )
  )
}