import { getComponentValue, Entity } from "@latticexyz/recs"
import { network } from "@modules/mud/initMud"

export function getRatId(playerId: string) {
  const { CurrentRat } = network.components
  return (getComponentValue(CurrentRat, playerId as Entity)?.value ?? "unknown rat") as string
}

export function getEntityIndex(id: string) {
  const { Index } = network.components
  return (getComponentValue(Index, id as Entity)?.value ?? 0) as number
}

export function getEntityName(id: string) {
  const { Name } = network.components
  return (getComponentValue(Name, id as Entity)?.value ?? "unknown entity") as string
}
